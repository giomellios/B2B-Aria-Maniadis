export {};

// Here we declare the members of the process.env object, so that we
// can use them in our application code in a type-safe manner.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV: string;
      PORT: string;
      COOKIE_SECRET: string;
      SUPERADMIN_USERNAME: string;
      SUPERADMIN_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: number;
      DB_NAME: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_SCHEMA: string;
      /** Public URL of the storefront, used in email links (default http://localhost:3001) */
      STOREFRONT_URL?: string;
      /** Sender for outgoing emails, e.g. "ARIA Bags & Hats" <orders@example.gr> */
      EMAIL_FROM?: string;
      /** SMTP settings — emails are only sent outside dev when SMTP_HOST is set */
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
      SMTP_PASSWORD?: string;
    }
  }
}
