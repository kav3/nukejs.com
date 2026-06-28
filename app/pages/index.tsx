import { useHtml } from "nukejs";
import Hero from "../components/Hero";
import SampleCodes from "../components/SampleCodes";
import Deploy from "../components/Deploy";
import Features from "../components/Features";
import Sponsors from "../components/Sponsors";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "../consts";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SITE_NAME,
    "url": SITE_URL,
    "description": SITE_DESCRIPTION,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Node.js",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
    },
    "license": "https://opensource.org/licenses/MIT",
}

export default async function Index() {
    useHtml({
        title: "Full-Stack React Framework",
        meta: [
            { property: "og:title", content: `${SITE_NAME} — React. Weaponized.` },
            { property: "og:url", content: SITE_URL },
        ],
        link: [
            { rel: "canonical", href: SITE_URL },
            { rel: "stylesheet", href: "/atom-one-dark.min.css" },
        ],
        // script: [
        //     {
        //         type: "application/ld+json",
        //         children: JSON.stringify(jsonLd),
        //     }
        // ],
    })
    return <>
        <Hero />
        <SampleCodes />
        <Features />
        <Deploy />
        <Sponsors />
    </>
}
