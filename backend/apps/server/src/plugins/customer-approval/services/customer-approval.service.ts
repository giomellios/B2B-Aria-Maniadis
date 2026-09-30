import { Injectable, OnModuleInit } from "@nestjs/common";
import { HistoryEntryType } from "@vendure/common/lib/generated-types";
import {
  AccountVerifiedEvent,
  Customer,
  CustomerService,
  EntityNotFoundError,
  EventBus,
  HistoryService,
  I18nError,
  ID,
  Logger,
  LoginEvent,
  LogLevel,
  NativeAuthenticationMethod,
  RequestContext,
  SessionService,
  TransactionalConnection,
  User,
  UserInputError,
} from "@vendure/core";

import { isCustomerApprovalPending } from "../config/approval-aware-native-authentication-strategy";
import { ACCOUNT_PENDING_APPROVAL, loggerCtx } from "../constants";
import { CustomerApprovalChangedEvent } from "../customer-approval-event";
import "../types";

/** Thrown (and shown to the storefront as the error message) when an unapproved customer gets a session. */
export class AccountPendingApprovalError extends I18nError {
  constructor() {
    super(ACCOUNT_PENDING_APPROVAL, {}, "FORBIDDEN", LogLevel.Verbose);
  }
}

@Injectable()
export class CustomerApprovalService implements OnModuleInit {
  constructor(
    private connection: TransactionalConnection,
    private customerService: CustomerService,
    private historyService: HistoryService,
    private sessionService: SessionService,
    private eventBus: EventBus
  ) {}

  onModuleInit() {
    // Defence in depth: the ApprovalAwareNativeAuthenticationStrategy stops the normal `login`,
    // but Vendure can also create a session from `verifyCustomerAccount` (email-verification
    // link). A blocking handler runs inside the same transaction, so throwing here rolls back
    // both the session and the verification.
    this.eventBus.registerBlockingEventHandler({
      event: LoginEvent,
      id: "customer-approval-login-guard",
      handler: async (event) => {
        if (event.ctx.apiType !== "shop") {
          return;
        }
        if (await isCustomerApprovalPending(this.connection, event.ctx, event.user.id)) {
          Logger.verbose(`Refused login for unapproved user ${event.user.id}`, loggerCtx);
          throw new AccountPendingApprovalError();
        }
      },
    });
  }

  async approve(ctx: RequestContext, customerId: ID): Promise<Customer> {
    const customer = await this.getCustomerWithUser(ctx, customerId);
    const user = customer.user as User;

    if (customer.customFields.approved !== true) {
      await this.setApproved(ctx, customer, true);
      await this.historyService.createHistoryEntryForCustomer({
        ctx,
        customerId: customer.id,
        type: HistoryEntryType.CUSTOMER_NOTE,
        data: {
          note: "Ο λογαριασμός εγκρίθηκε από διαχειριστή. / Account approved by an administrator.",
        },
      });
      await this.eventBus.publish(new CustomerApprovalChangedEvent(ctx, customer, true));
      Logger.info(`Customer ${customer.id} approved`, loggerCtx);
    }

    // Approval replaces email verification: mark the user verified so that Vendure's own
    // `requireVerification` check lets them log in, and discard any pending verification token.
    // (Customers get no verification email — see vendure-config.ts.)
    if (!user.verified) {
      await this.connection.getRepository(ctx, User).update(user.id, { verified: true });
      await this.connection
        .getRepository(ctx, NativeAuthenticationMethod)
        .update({ user: { id: user.id } }, { verificationToken: null });
      await this.historyService.createHistoryEntryForCustomer({
        ctx,
        customerId: customer.id,
        type: HistoryEntryType.CUSTOMER_VERIFIED,
        data: { strategy: "admin-approval" },
      });
      await this.eventBus.publish(new AccountVerifiedEvent(ctx, customer));
    }

    return this.getCustomerWithUser(ctx, customer.id);
  }

  async revoke(ctx: RequestContext, customerId: ID): Promise<Customer> {
    const customer = await this.getCustomerWithUser(ctx, customerId);
    if (customer.customFields.approved !== false) {
      await this.setApproved(ctx, customer, false);
      // Approval and verification go together: an unverified customer gets NotVerifiedError at
      // login, which the storefront shows as "please wait for admin verification".
      await this.connection
        .getRepository(ctx, User)
        .update((customer.user as User).id, { verified: false });
      // Log the customer out everywhere.
      await this.sessionService.deleteSessionsByUser(ctx, customer.user as User);
      await this.historyService.createHistoryEntryForCustomer({
        ctx,
        customerId: customer.id,
        type: HistoryEntryType.CUSTOMER_NOTE,
        data: {
          note: "Η έγκριση του λογαριασμού ανακλήθηκε. / Account approval revoked by an administrator.",
        },
      });
      await this.eventBus.publish(new CustomerApprovalChangedEvent(ctx, customer, false));
      Logger.info(`Customer ${customer.id} approval revoked`, loggerCtx);
    }
    return this.getCustomerWithUser(ctx, customer.id);
  }

  private async setApproved(ctx: RequestContext, customer: Customer, approved: boolean) {
    // Only touch the one column; saving the whole entity would also cascade into the user relation.
    await this.connection
      .getRepository(ctx, Customer)
      .update(customer.id, { customFields: { approved } });
    customer.customFields.approved = approved;
  }

  private async getCustomerWithUser(ctx: RequestContext, customerId: ID): Promise<Customer> {
    // CustomerService.findOne is channel-aware, so admins can only approve customers of their channel.
    const customer = await this.customerService.findOne(ctx, customerId, ["user"]);
    if (!customer) {
      throw new EntityNotFoundError("Customer", customerId);
    }
    if (!customer.user) {
      throw new UserInputError("Guest customers (without an account) cannot be approved");
    }
    return customer;
  }
}
