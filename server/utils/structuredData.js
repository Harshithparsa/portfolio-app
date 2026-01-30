/**
 * Structured Data (JSON-LD) generators for SEO
 */

const generatePersonSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "Person",
    "name": "Parsa",
    "url": "https://parsa.dev",
    "image": "https://parsa.dev/profile.png",
    "description": "Full-stack developer and designer specializing in modern web applications",
    "sameAs": [
      "https://www.linkedin.com/in/parsa",
      "https://github.com/parsa",
      "https://twitter.com/parsa"
    ],
    "jobTitle": "Full-Stack Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Self-Employed"
    },
    "knowsAbout": [
      "React",
      "Node.js",
      "MongoDB",
      "GraphQL",
      "Web Development",
      "Full-Stack Development",
      "WebSocket",
      "Three.js",
      "GSAP"
    ]
  };
};

const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "url": "https://parsa.dev",
    "name": "Parsa Portfolio",
    "description": "Full-stack developer portfolio showcasing modern web applications",
    "image": "https://parsa.dev/og-image.png",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://parsa.dev/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
};

const generateProjectSchema = (project) => {
  return {
    "@context": "https://schema.org/",
    "@type": "SoftwareSourceCode",
    "name": project.title,
    "description": project.description,
    "url": `https://parsa.dev/project/${project._id}`,
    "image": project.image || "https://parsa.dev/default-project.png",
    "programmingLanguage": project.technologies || [],
    "dateCreated": project.createdAt || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Parsa"
    },
    "codeRepository": project.githubUrl || undefined
  };
};

const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

const generateContactSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "ContactPoint",
    "contactType": "General",
    "email": process.env.CONTACT_EMAIL || "contact@parsa.dev",
    "url": "https://parsa.dev/contact",
    "availableLanguage": ["English"]
  };
};

const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Parsa",
    "url": "https://parsa.dev",
    "logo": "https://parsa.dev/logo.png",
    "description": "Full-stack developer and designer",
    "sameAs": [
      "https://www.linkedin.com/in/parsa",
      "https://github.com/parsa",
      "https://twitter.com/parsa"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "General",
      "email": process.env.CONTACT_EMAIL || "contact@parsa.dev"
    }
  };
};

const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

/**
 * Insert structured data in HTML head
 */
const getStructuredDataHTML = (schemas) => {
  return schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');
};

module.exports = {
  generatePersonSchema,
  generateWebsiteSchema,
  generateProjectSchema,
  generateBreadcrumbSchema,
  generateContactSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  getStructuredDataHTML
};
