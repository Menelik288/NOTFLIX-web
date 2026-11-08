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

        // Detailed Cast & Roles
        cast: [
            { name: "Matt Damon", character: "Odysseus (King of Ithaca)", avatar: "https://i.pravatar.cc/100?img=53" },
            { name: "Tom Holland", character: "Telemachus", avatar: "https://i.pravatar.cc/100?img=11" },
            { name: "Anne Hathaway", character: "Penelope", avatar: "https://i.pravatar.cc/100?img=47" },
            { name: "Zendaya", character: "Athena", avatar: "https://i.pravatar.cc/100?img=49" },
            { name: "Robert Pattinson", character: "Antinous (Chief Suitor)", avatar: "https://i.pravatar.cc/100?img=60" },
            { name: "Charlize Theron", character: "Calypso", avatar: "https://i.pravatar.cc/100?img=45" },
            { name: "Lupita Nyong'o", character: "Circe", avatar: "https://i.pravatar.cc/100?img=35" },
            { name: "Samantha Morton", character: "Scylla (Performance)", avatar: "https://i.pravatar.cc/100?img=32" }
        ],

        // Available Playback Renditions
        renditions: [
            {
                id: "vip4k",
                name: "VIP 4K Mode (Default)",
                shortBadge: "VIP 4K",
                badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
                targetRatio: 1.43,
                type: "iframe",
                embedUrl: "https://vidsrc.me/embed/movie?tmdb=1368337",
                resolutionLabel: "VIP 4K Ultra Fast Stream",
                description: "VIP 4K ultra fast streaming server for The Odyssey (TMDB: 1368337).",
                isExpanded143: true,
                isGenuineSource: true
            },
            {
                id: "vidbing",
                name: "Vidbing Stream",
                shortBadge: "VIDBING",
                badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
                targetRatio: 1.43,
                type: "iframe",
                embedUrl: "https://moviesapi.to/movie/1368337",
                resolutionLabel: "Vidbing Fast Stream (1080p/4K)",
                description: "Primary Vidbing stream for The Odyssey (TMDB: 1368337).",
                isExpanded143: true,
                isGenuineSource: true
            },
            {
                id: "vidsrc",
                name: "VidSrc Mirror",
                shortBadge: "VIDSRC",
                badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
                targetRatio: 1.43,
                type: "iframe",
                embedUrl: "https://vidsrc-embed.ru/embed/movie/1368337",
                resolutionLabel: "VidSrc Cinema Mirror",
                description: "VidSrc streaming mirror for The Odyssey (TMDB: 1368337).",
                isExpanded143: true,
                isGenuineSource: true
            },
            {
                id: "expanded-143",
                name: "IMAX 1.43:1 Expanded 70mm Sequence",
                shortBadge: "1.43:1 NATIVE",
                badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
                targetRatio: 1.43,
                type: "video",
                resolutionLabel: "4K Expanded Master (1.43:1)",
                description: "Authentic 1.43:1 tall frame presentation matching 15/70mm IMAX cinema screens. Preserves full vertical height without any cropping or horizontal stretch.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                isExpanded143: true,
                isGenuineSource: true
            },
            {
                id: "digital-190",
                name: "IMAX 1.90:1 Digital Large Format",
                shortBadge: "1.90:1 DIGITAL",
                badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
                targetRatio: 1.90,
                type: "video",
                resolutionLabel: "4K Digital Large Format (1.90:1)",
                description: "Digital IMAX 1.90:1 aspect ratio presentation optimized for commercial IMAX laser multiplexes.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                isExpanded143: false,
                isGenuineSource: true
            },
            {
                id: "theatrical-trailer",
                name: "Official Studio Teaser Trailer (16:9)",
                shortBadge: "16:9 WIDESCREEN",
                badgeColor: "bg-white/10 text-white/70 border-white/20",
                targetRatio: 1.777,
                type: "video",
                resolutionLabel: "1080p Standard Widescreen",
                description: "Standard 16:9 widescreen trailer broadcast presentation. Does not feature the expanded vertical picture information.",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                isExpanded143: false,
                isGenuineSource: false
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

