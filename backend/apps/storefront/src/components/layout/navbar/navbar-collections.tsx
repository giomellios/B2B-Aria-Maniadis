import { getTopCollections } from "@/lib/queries/cached";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/design-system";
import { NavbarLink } from "@/components/layout/navbar/navbar-link";

export async function NavbarCollections() {
  const collections = await getTopCollections();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {collections.map((collection) => (
          <NavigationMenuItem key={collection.slug}>
            <NavbarLink href={`/collection/${collection.slug}`}>{collection.name}</NavbarLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
