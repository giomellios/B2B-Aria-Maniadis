import { User } from "@/design-system/icons";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system";
import { Link } from "@/lib/i18n/navigation";
import { getT } from "@/lib/i18n/server";
import { LoginButton } from "@/features/auth/components/login-button";
import { getActiveCustomer } from "@/features/auth/services/customer.service";

export async function NavbarUser() {
  const [customer, t] = await Promise.all([getActiveCustomer(), getT()]);

  if (!customer) {
    return (
      <Button variant="secondary" size="sm" className="ml-1" asChild>
        <LoginButton isLoggedIn={false} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <User className="size-5" />
          <span className="hidden sm:inline">{customer.firstName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem asChild>
          <Link href="/account/profile">{t.nav.profile}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders">{t.nav.orders}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LoginButton isLoggedIn={true} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
