import {
  NavigationMenu,
  NavigationMenuBarLink,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white via-white via-60% to-[#fbf0ea] p-10 flex flex-col items-center justify-between">
      {/* Top Floating Glass Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Surface</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul>
                  <li>
                    <NavigationMenuLink
                      render={<a href="/bezel" />}
                      title="Bezel"
                    >
                      The refracting rim, measured inward from the edge.
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink
                      render={<a href="/blur" />}
                      title="Blur"
                    >
                      Optical dispersion and frosted background diffusion.
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuBarLink
                render={<a href="/handbook" />}
              >
                Handbook
              </NavigationMenuBarLink>
            </NavigationMenuItem>
          </NavigationMenuList>

          <NavigationMenuPopup />
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <Button variant="glass" size="sm">
            Handbook
          </Button>
          <Button variant="accent" size="sm">
            Continue
          </Button>
        </div>
      </header>

      {/* Center Hero */}
      <section className="my-auto text-center flex flex-col items-center gap-6 max-w-md text-white">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-md">
          Glass Surfaces
        </h1>
        <p className="text-sm text-stone-200 drop-shadow">
          Refraction, specular highlights, and seamless router integration with Base UI's <code className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono text-xs">render</code> prop.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="accent">Continue</Button>
          <Button variant="glass">Handbook</Button>
        </div>
      </section>

      <footer className="text-xs text-white/70">
        Liqui Design · Polymorphic <code className="font-mono text-white/90">render</code> Prop Support
      </footer>
    </main>
  );
}
