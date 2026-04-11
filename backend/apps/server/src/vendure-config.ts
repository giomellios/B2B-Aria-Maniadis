import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
    LanguageCode,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin, configureS3AssetStorage } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import { GreekTranslationsPlugin } from './plugins/greek-translations/greek-translations.plugin';
import { TranslationSyncPlugin } from './plugins/translation-sync/translation-sync.plugin';
import { CsvImportPlugin } from './plugins/csv-import/csv-import.plugin';
import 'dotenv/config';
import path from 'path';

const IS_DEV = process.env.APP_ENV === "dev";
const IS_WORKER = process.env.VENDURE_ROLE === "worker";
const serverPort = +process.env.PORT || 3000;
const useS3AssetStorage = !IS_DEV;
const assetUrlPrefix = process.env.ASSET_URL_PREFIX?.trim()
  ? (process.env.ASSET_URL_PREFIX!.endsWith('/')
    ? process.env.ASSET_URL_PREFIX
    : `${process.env.ASSET_URL_PREFIX}/`)
  : undefined;

if (useS3AssetStorage && (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY || !process.env.S3_ENDPOINT)) {
    throw new Error('Cloudflare R2 asset storage is required. Set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT.');
}

const s3AssetStorage = useS3AssetStorage
  ? configureS3AssetStorage({
      bucket: process.env.S3_BUCKET!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      nativeS3Configuration: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION ?? 'auto',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE
          ? process.env.S3_FORCE_PATH_STYLE === 'true'
          : true,
        signatureVersion: 'v4',
      },
    })
  : undefined;

export const config: VendureConfig = {
  apiOptions: {
    port: serverPort,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    trustProxy: IS_DEV ? false : 1,
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
      ? {
          adminApiDebug: true,
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    requireVerification: false,
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },
  dbConnectionOptions: {
    type: "postgres",
    // See the README.md "Migrations" section for an explanation of
    // the `synchronize` and `migrations` options.
    synchronize: IS_DEV && !IS_WORKER,
    migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  customFields: {},
  plugins: [
    GraphiqlPlugin.init(),
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../static/assets"),
      storageStrategyFactory: s3AssetStorage,
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : assetUrlPrefix,
    }),
    DefaultSchedulerPlugin.init(),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, "../static/email/test-emails"),
      route: "mailbox",
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(
        path.join(__dirname, "../static/email/templates")
      ),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: "http://localhost:8080/verify",
        passwordResetUrl: "http://localhost:8080/password-reset",
        changeEmailAddressUrl: "http://localhost:8080/verify-email-address-change",
      },
    }),
    DashboardPlugin.init({
      route: "dashboard",
      appDir: IS_DEV
        ? path.join(__dirname, "../dist/dashboard")
        : path.join(__dirname, "dashboard"),
    }),
    GreekTranslationsPlugin,
    TranslationSyncPlugin,
    CsvImportPlugin,
  ],
};
