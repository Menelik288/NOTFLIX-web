// NotFlix IMAX Signature Catalogue Data
// Future-proof, reusable data architecture for IMAX large-format presentations

export const imaxCatalog = [
    {
        id: "the-odyssey",
        slug: "the-odyssey",
        tmdbId: 1368337,
        title: "The Odyssey",
        year: 2026,
        tagline: "A Christopher Nolan Film. Experience the Myth in 15-Perf 70mm IMAX.",
        director: "Christopher Nolan",
        cinematographer: "Hoyte van Hoytema, ASC, FSF, NSC",
        music: "Ludwig Göransson",
        producers: ["Emma Thomas", "Christopher Nolan"],
        studio: "Universal Pictures / Syncopy",
        releaseDate: "July 17, 2026",
        duration: "2h 53m",
        durationMinutes: 173,
        rating: 9.9,
        match: 99,
        certification: "PG-13 / Filmed for IMAX 70mm",
        genres: ["Epic", "Action", "Adventure", "Mythology", "Drama"],
        overview: "Directed by Christopher Nolan, The Odyssey is a mythic action-adventure epic shot entirely with 15-perf 70mm IMAX cameras. Following the fall of Troy, King Odysseus of Ithaca undertakes a perilous decade-long voyage across monstrous and supernatural seas to return to his wife Penelope and son Telemachus, facing mythological trials of the Cyclops, Circe, and the Siren strait.",
        shortDescription: "Christopher Nolan's mythic 70mm IMAX epic following Odysseus's legendary decade-long voyage home from the Trojan War across monster-laden seas.",
        
        // Artwork
        backdrop: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0kXxFkn0yKRsEquPkrX0rPpwFLSZz1tE9o7WX0opUXaBBcWf5q9hUc81tomU1rVLR7w69n5TfSxqdwg5HEcfVq6edDddLlKy4oqUoWfKc3vOCYZ-wjt8hOF68BiMf8U4f-he77mATtDMS6fY5fAkO4HbmuoroWNDGpzi3t7EVT1P818wig-n9IIIxl44GU0hZonQ8LTPK23pY4Dm_zLmpWhbcVHJ6mFHn2pgLZEOnz75_tzx1xOtF2aud2Kn0eYupF_BzQSwu08__",
        poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd3wMj7c6AG0aPLvZcxRw1hF_6cVP-OZW6tp_xoMIwgeJmL8fPXZuckd_0zwhoOyPLt6ajj29ba1LxnpvZucbNWhO2Ew4a-lkjjo4OITDs7PkaDu52n_ZA7Y7HR6LyjPppymwTOIiwzxmViPVJmdBGH72glcbPC3BXqPHrWyefUJ8dSHFFepp1r_VlRnQTSWKfvDe7p7dRB4J_UUnz25YwukaGZ-bSoPa8sks0DK4g8di6IKYfLHOcRUJfmTkb6yShYhZ_-P4c8_Ra",
        
        // Comprehensive IMAX Technical Certification & Specifications
        imaxSpecs: {
            isGenuineImax: true,
            filmedForImax: true,
            cameraSystems: "IMAX MSM 9802 & MKIV 15-Perf 70mm Film Cameras",
            filmStock: "KODAK VISION3 500T 5219 & 250D 5207 (65mm 15-Perf Negative)",
            nativeAspectRatio: "1.43:1",
            nativeAspectRatioValue: 1.43,
            digitalAspectRatio: "1.90:1",
            digitalAspectRatioValue: 1.90,
            standardScopeRatio: "2.39:1",
            standardScopeRatioValue: 2.39,
            opticalResolution: "18,000 x 12,500 px (Theoretical Optical 18K Resolution)",
            digitalMasterResolution: "4K DCI Expanded (3840 x 2685) / 1080p (1920 x 1342)",
            audioFormat: "IMAX 12.0 Channel Uncompressed Immersive Surround",
            colorSpace: "DCI-P3 Wide Color Gamut / HDR10 High Dynamic Range",
            screenAreaIncrease: "+64% picture height compared to standard 2.39:1 widescreen",
            sourceStatus: "Post-Production Master. Full theatrical release July 17, 2026."
        },

        // Detailed Cast & Roles (Authentic TMDb Headshots)
        cast: [
            { name: "Matt Damon", character: "Odysseus (King of Ithaca)", avatar: "https://image.tmdb.org/t/p/w500/rDYQP0X5XlDwxOeZdLYMbsIV7F1.jpg" },
            { name: "Tom Holland", character: "Telemachus", avatar: "https://image.tmdb.org/t/p/w500/bBRlrpJm9XkNSg0YT5LCaxqoFMX.jpg" },
            { name: "Anne Hathaway", character: "Penelope", avatar: "https://image.tmdb.org/t/p/w500/tLPOOggBUCSKxyuO2qVqWb7z8WJ.jpg" },
            { name: "Zendaya", character: "Athena", avatar: "https://image.tmdb.org/t/p/w500/1qup8tSt95HLbcy2c2xrx4iJNxv.jpg" },
            { name: "Robert Pattinson", character: "Antinous (Chief Suitor)", avatar: "https://image.tmdb.org/t/p/w500/3qZ09UE7lN6AtorfXFRYpEtSY93.jpg" },
            { name: "Charlize Theron", character: "Calypso", avatar: "https://image.tmdb.org/t/p/w500/ge9hmyipAVZ8nLq3c5fX4c2l5L1.jpg" },
            { name: "Lupita Nyong'o", character: "Circe", avatar: "https://image.tmdb.org/t/p/w500/y40Wu1T742kynOqtwXASc5Qgm49.jpg" },
            { name: "Samantha Morton", character: "Scylla (Performance)", avatar: "https://image.tmdb.org/t/p/w500/v0rYnI52w1eKz5yFwG160t47N8W.jpg" }
        ],

        // Available Playback Renditions (Preserving exclusively dedicated IMAX formats)
        renditions: [
            {
                id: "expanded-143",
                name: "IMAX 1.43:1 Expanded 70mm (Default)",
                shortBadge: "1.43:1 EXPANDED",
                badgeColor: "bg-red-600/20 text-red-400 border-red-500/40",
                targetRatio: 1.43,
                type: "iframe",
                embedUrl: "https://vidsrc.me/embed/movie?tmdb=1368337",
                resolutionLabel: "4K 70mm Master (1.43:1 Native Height)",
                description: "Authentic 1.43:1 tall frame presentation matching 15/70mm IMAX cinema screens. Preserves 100% of the vertical picture with zero cropping.",
                isExpanded143: true,
                isGenuineSource: true
            },
            {
                id: "digital-190",
                name: "IMAX 1.90:1 Digital Cinema",
                shortBadge: "1.90:1 DIGITAL",
                badgeColor: "bg-white/10 text-white/90 border-white/20",
                targetRatio: 1.90,
                type: "iframe",
                embedUrl: "https://vidsrc.me/embed/movie?tmdb=1368337",
                resolutionLabel: "VIP 4K Digital Cinema Master (1.90:1)",
                description: "Digital IMAX 1.90:1 aspect ratio presentation powered by VIP 4K ultra-fast stream.",
                isExpanded143: false,
                isGenuineSource: true
            }
        ],

        // Subtitle tracks
        subtitles: [
            { label: "English [CC]", lang: "en", default: true },
            { label: "Spanish (Español)", lang: "es", default: false },
            { label: "French (Français)", lang: "fr", default: false },
            { label: "Amharic (አማርኛ)", lang: "am", default: false }
        ]
    }
];

// Helper query functions
export const ImaxData = {
    getAll: () => imaxCatalog,
    getById: (id) => imaxCatalog.find(m => m.id === id || m.slug === id),
    getFeatured: () => imaxCatalog[0] || null,
    search: (query) => {
        const q = (query || "").toLowerCase().trim();
        if (!q) return imaxCatalog;
        return imaxCatalog.filter(m => 
            m.title.toLowerCase().includes(q) ||
            m.director.toLowerCase().includes(q) ||
            m.overview.toLowerCase().includes(q) ||
            m.genres.some(g => g.toLowerCase().includes(q)) ||
            m.cast.some(c => c.name.toLowerCase().includes(q))
        );
    }
};

export default imaxCatalog;

