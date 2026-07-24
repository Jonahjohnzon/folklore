// lib/googlePlay.ts
import { google } from "googleapis";

const PACKAGE_NAME = "com.tipatale.app";

function getAndroidPublisher() {
  const credentials = JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return google.androidpublisher({ version: "v3", auth });
}

export async function verifyGooglePlayPurchase(productId: string, purchaseToken: string) {
  const androidpublisher = getAndroidPublisher();
  const res = await androidpublisher.purchases.products.get({
    packageName: PACKAGE_NAME,
    productId,
    token: purchaseToken,
  });
  const isValid = res.data.purchaseState === 0;
  const isAlreadyConsumed = res.data.consumptionState === 1;
  return { isValid, isAlreadyConsumed };
}

export async function consumeGooglePlayPurchase(productId: string, purchaseToken: string) {
  const androidpublisher = getAndroidPublisher();
  await androidpublisher.purchases.products.consume({
    packageName: PACKAGE_NAME,
    productId,
    token: purchaseToken,
  });
}