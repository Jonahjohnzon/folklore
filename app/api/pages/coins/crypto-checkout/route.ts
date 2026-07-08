import { withAuth } from "@/app/api/auth/withAuth";
import { cryptoCheckoutProvider } from "@/app/api/lib/services/cryptoCheckout";
import { COIN_PACKAGES, totalCoins } from "@/lib/coin-packages";
import { ok, fail } from "@/app/api/response";

export const POST = withAuth(async (req) => {
  try {
    const { packageId } = await req.json();
    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return fail(new Error("Unknown package."));

    const reference = `coins_${req.user.sub}_${Date.now()}`;
    const result = await cryptoCheckoutProvider.startCheckout({
      userId: req.user.sub,
      packageId,
      usdAmount: pkg.usdPrice,
      coins: totalCoins(pkg), // includes bonusCoins — matches what gets credited on webhook
      reference,
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
});