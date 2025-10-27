import "i18next";

import en from "../public/locales/en/translation.json";
import zh from "../public/locales/zh/translation.json";

type RemovePluralSuffix<T extends string> =
  T extends `${infer Key}${"" | "_ordinal"}_${"zero" | "one" | "two" | "few" | "many" | "other"}` ? Key : T;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      // Using intersection to ensure that any string is translated in all locales before it can be referenced
      translation: Record<RemovePluralSuffix<keyof typeof zh> & RemovePluralSuffix<keyof typeof en>, string>;
    };
  }
}
