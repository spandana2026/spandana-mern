import { AlertTriangle } from "lucide-react";

interface ShopAdminTabProps {
  token: string;
}

/**
 * NOTE FOR DEVELOPERS:
 * The original version of this tab imported hooks (useListShopProducts,
 * useCreateShopProduct, etc.) from a package called "@workspace/api-client-react".
 * That package was never included in this project export and doesn't exist on npm,
 * and the backend also has no /shop or /admin/shop routes, models, or controllers
 * implemented (see backend/routes/v1 — there is no shop.js).
 *
 * That combination made the production build fail (Rollup couldn't resolve the
 * import), which would have blocked deployment entirely. This placeholder keeps the
 * app buildable and the "Shop" tab in the admin panel functional-looking without
 * pretending to talk to a backend that isn't there.
 *
 * To make Shop management real:
 *  1. Add backend/models/Product.js, Order.js (or equivalent) + a
 *     backend/routes/v1/shop.js with the product/order CRUD endpoints.
 *  2. Replace this file's body with a UI that calls those endpoints — the
 *     original src/services/shopService.js already has a matching set of
 *     fetch helpers (getProducts, createProduct, updateProduct, deleteProduct,
 *     getOrders) you can build on with useQuery/useMutation from
 *     @tanstack/react-query (already a project dependency).
 *  3. The original (broken) UI code — which has the full product/order management
 *     screens already designed — was preserved at
 *     src/components/admin/ShopAdminTab.broken-reference.tsx.bak for reference.
 */
export default function ShopAdminTab({ token: _token }: ShopAdminTabProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={18} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold">Shop</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Not connected to a backend yet</p>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 leading-relaxed">
        <p className="font-semibold mb-2">This section needs backend work before it can be used.</p>
        <p>
          The Shop admin screens in this build depended on a package
          (<code className="font-mono text-xs">@workspace/api-client-react</code>) that was
          never included in the project, and there are no <code className="font-mono text-xs">/shop</code>{" "}
          or <code className="font-mono text-xs">/admin/shop</code> routes on the backend to power it.
          It's been replaced with this notice so the rest of the site builds and deploys correctly.
        </p>
      </div>
    </div>
  );
}
