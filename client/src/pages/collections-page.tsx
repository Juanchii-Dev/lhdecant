import Collections from "../components/collections";
import { CollectionsSEO } from "../components/seo";

export default function CollectionsPage() {
  return (
    <div className="pt-24">
      <CollectionsSEO />
      <Collections />
    </div>
  );
} 