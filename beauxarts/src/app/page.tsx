
import Shop from "./shop/page";
import { SearchProvider } from "@/context/SearchContext";

export default function Home() {
  return (
    <div className=" min-h-screen  bg-zinc-50 font-sans dark:bg-black">
        <SearchProvider>
        <Shop />

        </SearchProvider>
      
    </div>
  );
}
