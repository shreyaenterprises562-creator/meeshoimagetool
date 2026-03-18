import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
return [
{
url: "https://meeshoimagetool-production.up.railway.app/",
lastModified: new Date(),
changeFrequency: "daily",
priority: 1,
},
{
url: "https://optaimager.com/optimize",
lastModified: new Date(),
changeFrequency: "weekly",
priority: 0.8,
},
];
}
