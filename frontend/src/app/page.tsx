import { FlagshipCheckout } from "./home-v3/FlagshipCheckout";
import { HomeHero } from "./home-v3/HomeHero";
import { WebsiteProduct } from "./home-v3/WebsiteProduct";
import styles from "./home-v3/page.module.css";

export default function Home() {
  return <main className={styles.page}><HomeHero /><FlagshipCheckout /><WebsiteProduct /></main>;
}
