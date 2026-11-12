package com.verse.backend.config;
import com.verse.backend.document.*;
import com.verse.backend.entity.*;
import com.verse.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PoemRepository poemRepository;
    private final ChallengeRepository challengeRepository;
    private final MarketplaceItemRepository marketplaceItemRepository;
    private final PoemDocumentRepository poemDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderDocumentRepository orderDocumentRepository;
    private final CommentDocumentRepository commentDocumentRepository;
    private final ReviewRequestRepository reviewRequestRepository;
    private final PoemInteractionRepository poemInteractionRepository;

    public DataSeeder(
            UserRepository userRepository,
            PoemRepository poemRepository,
            ChallengeRepository challengeRepository,
            MarketplaceItemRepository marketplaceItemRepository,
            PoemDocumentRepository poemDocumentRepository,
            PasswordEncoder passwordEncoder,
            SubscriptionRepository subscriptionRepository,
            OrderDocumentRepository orderDocumentRepository,
            CommentDocumentRepository commentDocumentRepository,
            ReviewRequestRepository reviewRequestRepository,
            PoemInteractionRepository poemInteractionRepository) {
        this.userRepository = userRepository;
        this.poemRepository = poemRepository;
        this.challengeRepository = challengeRepository;
        this.marketplaceItemRepository = marketplaceItemRepository;
        this.poemDocumentRepository = poemDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.subscriptionRepository = subscriptionRepository;
        this.orderDocumentRepository = orderDocumentRepository;
        this.commentDocumentRepository = commentDocumentRepository;
        this.reviewRequestRepository = reviewRequestRepository;
        this.poemInteractionRepository = poemInteractionRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@kavyakosh.in").isEmpty()) {
            userRepository.save(User.builder()
                    .email("admin@kavyakosh.in")
                    .username("SystemAdmin")
                    .bio("System Administrator")
                    .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Admin")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.ADMIN)
                    .status(User.UserStatus.ACTIVE)
                    .build());
        }

        // --- Writers ---
        User mirza = userRepository.findByEmail("mirza.ghalib@kavyakosh.in").orElse(null);
        User gulzar = userRepository.findByEmail("gulzar@kavyakosh.in").orElse(null);
        User amrita = userRepository.findByEmail("amrita.pritam@kavyakosh.in").orElse(null);
        User kabir = userRepository.findByEmail("kabir.das@kavyakosh.in").orElse(null);
        User priya = userRepository.findByEmail("priya.sharma@kavyakosh.in").orElse(null);
        User arjun = userRepository.findByEmail("arjun.mehta@kavyakosh.in").orElse(null);

        if (userRepository.count() <= 1) {
            mirza = userRepository.save(User.builder()
                    .email("mirza.ghalib@kavyakosh.in")
                .username("MirzaGhalib")
                .bio("Urdu and Persian poet of the Mughal era. Master of the ghazal.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=MirzaGhalib")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.PREMIUM)
                .followerCount(48200)
                .featuredWriter(true)
                .build());

        gulzar = userRepository.save(User.builder()
                .email("gulzar@kavyakosh.in")
                .username("Gulzar")
                .bio("Lyricist, poet, and film director. Words that paint the soul.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Gulzar")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.PREMIUM)
                .followerCount(92400)
                .featuredWriter(true)
                .build());

        amrita = userRepository.save(User.builder()
                .email("amrita.pritam@kavyakosh.in")
                .username("AmritaPritam")
                .bio("Pioneer of Punjabi literature. Her ink still bleeds with longing.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=AmritaPritam")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.PREMIUM)
                .followerCount(67800)
                .featuredWriter(true)
                .build());

        kabir = userRepository.save(User.builder()
                .email("kabir.das@kavyakosh.in")
                .username("KabirDas")
                .bio("Mystic poet-saint. Weaving divine wisdom into simple dohas.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=KabirDas")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.PREMIUM)
                .followerCount(35600)
                .featuredWriter(true)
                .build());

        priya = userRepository.save(User.builder()
                .email("priya.sharma@kavyakosh.in")
                .username("PriyaVerse")
                .bio("Contemporary Hindi poet. Exploring the feminine gaze in modern India.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerse")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.REVIEWER)
                .followerCount(18900)
                .featuredWriter(true)
                .build());

        arjun = userRepository.save(User.builder()
                .email("arjun.mehta@kavyakosh.in")
                .username("ArjunMehta")
                .bio("Bilingual poet writing at the intersection of English and Urdu.")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMehta")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(User.Role.USER)
                .followerCount(12300)
                .featuredWriter(true)
                .build());
        }

        // --- Poems ---
        if (poemRepository.count() == 0 && mirza != null) {
        poemRepository.saveAll(List.of(
            Poem.builder()
                .title("Hazaaron Khwahishen Aisi")
                .excerpt("Hazaaron khwahishen aisi ke har khwahish pe dam nikle,\nBahut nikle mere armaan lekin phir bhi kam nikle.")
                .content("Hazaaron khwahishen aisi ke har khwahish pe dam nikle,\nBahut nikle mere armaan lekin phir bhi kam nikle.\n\nNikalna khuld se Adam ka sunte aaye hain lekin,\nBahut be-aabru hokar tere kooche se hum nikle.")
                .category("Ghazal")
                .author(mirza)
                .likesCount(4821)
                .viewsCount(18400)
                .commentsCount(312)
                .trendingScore(98.7)
                .build(),

            Poem.builder()
                .title("Tere Bina Zindagi Se")
                .excerpt("Tere bina zindagi se koi shikwa toh nahin,\nTere bina zindagi bhi lekin zindagi toh nahin.")
                .content("Tere bina zindagi se koi shikwa toh nahin,\nTere bina zindagi bhi lekin zindagi toh nahin.\n\nChand tanha hai aasmaaN mein,\nDhundta hai tujhe jahan mein.")
                .category("Nazm")
                .author(gulzar)
                .likesCount(6203)
                .viewsCount(24100)
                .commentsCount(487)
                .trendingScore(97.2)
                .build(),

            Poem.builder()
                .title("Aj Aakhaan Waris Shah Nu")
                .excerpt("Aj aakhaan Waris Shah nu, kitto qabraan vichon bol,\nTe aj kitaab-e-ishq da koi agla varka phol.")
                .content("Aj aakhaan Waris Shah nu, kitto qabraan vichon bol,\nTe aj kitaab-e-ishq da koi agla varka phol.\n\nIk roi si dhee Punjab di, tu likh likh maare wain,\nAj lakhaan dheeyan rondiyan, tenu Waris Shah nu kain.")
                .category("Punjabi Kavita")
                .author(amrita)
                .likesCount(5419)
                .viewsCount(21300)
                .commentsCount(398)
                .trendingScore(95.8)
                .build(),

            Poem.builder()
                .title("Maati Kahe Kumhar Se")
                .excerpt("Maati kahe kumhar se, tu kya roonde mohe,\nEk din aisa aayega, main roondunga tohe.")
                .content("Maati kahe kumhar se, tu kya roonde mohe,\nEk din aisa aayega, main roondunga tohe.\n\nSadhu aisa chahiye, jaisa soopa hoye,\nSaar saar ko gahi rahe, thotha de ur joye.")
                .category("Doha")
                .author(kabir)
                .likesCount(3876)
                .viewsCount(15600)
                .commentsCount(224)
                .trendingScore(93.1)
                .build(),

            Poem.builder()
                .title("Shahr-e-Dil")
                .excerpt("Ek shahr basaya tha maine\ndil ki khaali zameen par,\nMohalle the yadoon ke\naur galiyan khayalon ki.")
                .content("Ek shahr basaya tha maine\ndil ki khaali zameen par,\nMohalle the yadoon ke\naur galiyan khayalon ki.\n\nAb woh shahr udaas hai,\nKyunki tu ja chuka hai,\nAur main uske khaNdaron mein\nakela bhatakta hoon.")
                .category("Nazm")
                .author(priya)
                .likesCount(2943)
                .viewsCount(11200)
                .commentsCount(186)
                .trendingScore(90.4)
                .build(),

            Poem.builder()
                .title("Between Languages")
                .excerpt("I write in two tongues\nbut feel in neither—\na bridge over a river\nthat flows only in dreams.")
                .content("I write in two tongues\nbut feel in neither—\na bridge over a river\nthat flows only in dreams.\n\nUrdu on my lips\nEnglish in my mind,\nHome is the hyphen\nI carry between them.")
                .category("Free Verse")
                .author(arjun)
                .likesCount(1876)
                .viewsCount(8900)
                .commentsCount(134)
                .trendingScore(87.6)
                .build(),

            Poem.builder()
                .title("Monsoon Ghazal")
                .excerpt("Baarish ki har boond mein teri yaad hai sanam,\nSaawan mein bhi barsa dard ka junoon tamaam.")
                .content("Baarish ki har boond mein teri yaad hai sanam,\nSaawan mein bhi barsa dard ka junoon tamaam.\n\nBheegi mitti ki khushboo jo uthti hai abhi,\nTeri khushboo ka hi yeh rang hai tamaam.")
                .category("Ghazal")
                .author(mirza)
                .likesCount(3241)
                .viewsCount(13800)
                .commentsCount(267)
                .trendingScore(91.3)
                .build(),

            Poem.builder()
                .title("Ibadat")
                .excerpt("Tujhe kho ke yeh jaana\nki tu hi meri ibadat tha,\nMeri har saans mein tha tu\ntu hi mera wajood tha.")
                .content("Tujhe kho ke yeh jaana\nki tu hi meri ibadat tha,\nMeri har saans mein tha tu\ntu hi mera wajood tha.\n\nAb mandir mein bhi pooja,\naur masjid mein bhi salaat,\nKoi na mila wahan mujhe\njaisa tha tu mere saath.")
                .category("Sufi")
                .author(gulzar)
                .likesCount(4102)
                .viewsCount(16700)
                .commentsCount(341)
                .trendingScore(94.5)
                .build()
        ));
        }

        // --- Challenges ---
        if (challengeRepository.count() == 0) {
        challengeRepository.saveAll(List.of(
            Challenge.builder()
                .title("Monsoon Muses")
                .description("Capture the essence of the Indian monsoon — the smell of petrichor, the sound of rain on rooftops, the longing it awakens. Write a poem of any form, any language.")
                .theme("Rain & Longing")
                .participantCount(1247)
                .deadline(LocalDateTime.now().plusDays(7))
                .status(Challenge.Status.ACTIVE)
                .prizeDescription("₹5,000 cash prize + Featured on KavyaKosh home")
                .build(),

            Challenge.builder()
                .title("Doha Duel — Kabir Tribute")
                .description("Write an original doha (couplet) in the tradition of Kabir Das — simple words, profound wisdom. The doha must carry a life lesson in exactly two lines.")
                .theme("Wisdom & Philosophy")
                .participantCount(834)
                .deadline(LocalDateTime.now().plusDays(14))
                .status(Challenge.Status.ACTIVE)
                .prizeDescription("Handcrafted poetry journal + ₹3,000")
                .build(),

            Challenge.builder()
                .title("Urban Loneliness")
                .description("The city is full of people yet we are utterly alone. Write a poem about modern urban solitude — the crowd, the noise, the silence within.")
                .theme("Solitude & Modernity")
                .participantCount(562)
                .deadline(LocalDateTime.now().plusDays(21))
                .status(Challenge.Status.ACTIVE)
                .prizeDescription("1-year KavyaKosh Premium subscription")
                .build()
        ));
        }

        // --- Marketplace Items ---
        if (marketplaceItemRepository.count() == 0) {
        marketplaceItemRepository.saveAll(List.of(
            MarketplaceItem.builder()
                .name("Divan-e-Ghalib: Collector's Edition")
                .description("A beautifully typeset collector's edition of Mirza Ghalib's complete Divan, with Urdu script, transliteration, and English translation side by side.")
                .price(new BigDecimal("849.00"))
                .imageUrl("https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400")
                .author("Mirza Ghalib")
                .type("BOOK")
                .rating(48)
                .reviewCount(342)
                .featured(true)
                .build(),

            MarketplaceItem.builder()
                .name("The Art of the Ghazal — Masterclass")
                .description("A 6-hour video course by award-winning poet Ashraf Raza on writing authentic ghazals. Covers radif, maqta, and the emotional arc of the ghazal form.")
                .price(new BigDecimal("1299.00"))
                .imageUrl("https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400")
                .author("Ashraf Raza")
                .type("COURSE")
                .rating(47)
                .reviewCount(189)
                .featured(true)
                .build(),

            MarketplaceItem.builder()
                .name("Monsoon Ghazal — Fine Art Print")
                .description("Limited edition A2 fine art print of 'Monsoon Ghazal', hand-lettered in traditional Nastaliq script on archival paper. Ready to frame.")
                .price(new BigDecimal("399.00"))
                .imageUrl("https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400")
                .author("Calligraphy by Fatima Khan")
                .type("PRINT")
                .rating(50)
                .reviewCount(97)
                .featured(true)
                .build(),

            MarketplaceItem.builder()
                .name("Kavyakosh Poet's Journal")
                .description("Premium hardcover journal with 240 pages of cream-laid paper, a ribbon bookmark, and a debossed feather quill logo. The perfect companion for writing poetry.")
                .price(new BigDecimal("299.00"))
                .imageUrl("https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400")
                .author("KavyaKosh")
                .type("MERCHANDISE")
                .rating(46)
                .reviewCount(214)
                .featured(true)
                .build()
        ));
        }

        // ── MongoDB Explore Feed Seed ─────────────────────────────────────────
        if (poemDocumentRepository.countByPublishedTrue() == 0 && mirza != null) {

        PoemDocument.AuthorSnapshot ghalibs = PoemDocument.AuthorSnapshot.builder()
                .userId(mirza.getId()).username("MirzaGhalib")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=MirzaGhalib").build();
        PoemDocument.AuthorSnapshot gulzars = PoemDocument.AuthorSnapshot.builder()
                .userId(gulzar.getId()).username("Gulzar")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Gulzar").build();
        PoemDocument.AuthorSnapshot amritas = PoemDocument.AuthorSnapshot.builder()
                .userId(amrita.getId()).username("AmritaPritam")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=AmritaPritam").build();
        PoemDocument.AuthorSnapshot kabirs = PoemDocument.AuthorSnapshot.builder()
                .userId(kabir.getId()).username("KabirDas")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=KabirDas").build();
        PoemDocument.AuthorSnapshot priyas = PoemDocument.AuthorSnapshot.builder()
                .userId(priya.getId()).username("PriyaVerse")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerse").build();
        PoemDocument.AuthorSnapshot arjuns = PoemDocument.AuthorSnapshot.builder()
                .userId(arjun.getId()).username("ArjunMehta")
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMehta").build();

        poemDocumentRepository.saveAll(List.of(

            // ─── Ghazals / Urdu ───────────────────────────────────────────────
            PoemDocument.builder().title("Hazaaron Khwahishen Aisi")
                .excerpt("Hazaaron khwahishen aisi ke har khwahish pe dam nikle,\nBahut nikle mere armaan lekin phir bhi kam nikle.")
                .content("Hazaaron khwahishen aisi ke har khwahish pe dam nikle,\nBahut nikle mere armaan lekin phir bhi kam nikle.\n\nNikalna khuld se Adam ka sunte aaye hain lekin,\nBahut be-aabru hokar tere kooche se hum nikle.")
                .category("Ghazal").mood("Melancholy").theme("Loss").language("Urdu")
                .tags(List.of("ghazal", "separation", "longing", "ghalib", "classic"))
                .author(ghalibs).likesCount(4821).viewsCount(18400).commentsCount(312).trendingScore(98.7)
                .createdAt(LocalDateTime.now().minusDays(45)).build(),

            PoemDocument.builder().title("Dil Dhoondta Hai Phir Wohi")
                .excerpt("Dil dhoondta hai phir wohi fursat ke raat din,\nBaithe rahein tasavvur-e-jaanaan kiye hue.")
                .content("Dil dhoondta hai phir wohi fursat ke raat din,\nBaithe rahein tasavvur-e-jaanaan kiye hue.\n\nPhir us ke dar pe jaayein ke woh bejurm-o-khata,\nTanha baithe hain dil ko taslim kiye hue.")
                .category("Ghazal").mood("Romance").theme("Love").language("Urdu")
                .tags(List.of("ghazal", "love", "nostalgia", "ghalib"))
                .author(ghalibs).likesCount(3541).viewsCount(14200).commentsCount(218).trendingScore(92.1)
                .createdAt(LocalDateTime.now().minusDays(60)).build(),

            PoemDocument.builder().title("Ishq Par Zor Nahin")
                .excerpt("Ishq par zor nahin, hai yeh woh aatish Ghalib,\nJo lagaaye na lage aur bujhaaye na bane.")
                .content("Ishq par zor nahin, hai yeh woh aatish Ghalib,\nJo lagaaye na lage aur bujhaaye na bane.\n\nMilunga aaj unse dil mein yeh umeed hai mujhe,\nKe door ho abhi tak jo judai ki sazaa bane.")
                .category("Sher").mood("Philosophy").theme("Love").language("Urdu")
                .tags(List.of("sher", "love", "philosophy", "ghalib", "fire"))
                .author(ghalibs).likesCount(2983).viewsCount(11700).commentsCount(187).trendingScore(88.4)
                .createdAt(LocalDateTime.now().minusDays(80)).build(),

            // ─── Gulzar / Hindi / Urdu ────────────────────────────────────────
            PoemDocument.builder().title("Tere Bina Zindagi Se")
                .excerpt("Tere bina zindagi se koi shikwa toh nahin,\nTere bina zindagi bhi lekin zindagi toh nahin.")
                .content("Tere bina zindagi se koi shikwa toh nahin,\nTere bina zindagi bhi lekin zindagi toh nahin.\n\nChand tanha hai aasmaaN mein, dhundta hai tujhe jahan mein,\nTere bina yeh chaandni bhi dhuaan dhuaan si hai.")
                .category("Nazm").mood("Melancholy").theme("Loss").language("Hindi")
                .tags(List.of("nazm", "separation", "gulzar", "heartbreak"))
                .author(gulzars).likesCount(6203).viewsCount(24100).commentsCount(487).trendingScore(97.2)
                .createdAt(LocalDateTime.now().minusDays(20)).build(),

            PoemDocument.builder().title("Ibadat")
                .excerpt("Tujhe kho ke yeh jaana\nki tu hi meri ibadat tha,\nMeri har saans mein tha tu\ntu hi mera wajood tha.")
                .content("Tujhe kho ke yeh jaana\nki tu hi meri ibadat tha,\nMeri har saans mein tha tu\ntu hi mera wajood tha.\n\nAb mandir mein bhi pooja, aur masjid mein bhi salaat,\nKoi na mila wahan mujhe jaisa tha tu mere saath.")
                .category("Sufi").mood("Devotion").theme("Spirituality").language("Hindi")
                .tags(List.of("sufi", "devotion", "worship", "gulzar", "love"))
                .author(gulzars).likesCount(4102).viewsCount(16700).commentsCount(341).trendingScore(94.5)
                .createdAt(LocalDateTime.now().minusDays(30)).build(),

            PoemDocument.builder().title("Monsoon Ghazal")
                .excerpt("Baarish ki har boond mein teri yaad hai sanam,\nSaawan mein bhi barsa dard ka junoon tamaam.")
                .content("Baarish ki har boond mein teri yaad hai sanam,\nSaawan mein bhi barsa dard ka junoon tamaam.\n\nBheegi mitti ki khushboo jo uthti hai abhi,\nTeri khushboo ka hi yeh rang hai tamaam.")
                .category("Ghazal").mood("Romance").theme("Seasons").language("Hindi")
                .tags(List.of("ghazal", "monsoon", "rain", "longing", "saawan"))
                .author(gulzars).likesCount(3241).viewsCount(13800).commentsCount(267).trendingScore(91.3)
                .createdAt(LocalDateTime.now().minusDays(10)).build(),

            PoemDocument.builder().title("Kinara")
                .excerpt("Woh jo hai na yeh kinara,\nNa doob sakta, na par ho sakta.\nBas lahron se takrake\nhone ki koshish karta hoon.")
                .content("Woh jo hai na yeh kinara,\nNa doob sakta, na par ho sakta.\nBas lahron se takrake\nhone ki koshish karta hoon.\n\nSamundar mujhse kehta hai:\n'Tum mere nahi ho.'\nKinara mujhse kehta hai:\n'Tum mere bhi nahi ho.'\nAur main beech mein\nsilsila hoon kisi adhuri baat ka.")
                .category("Nazm").mood("Melancholy").theme("Identity").language("Hindi")
                .tags(List.of("nazm", "identity", "existential", "sea", "gulzar"))
                .author(gulzars).likesCount(2674).viewsCount(10300).commentsCount(198).trendingScore(86.7)
                .createdAt(LocalDateTime.now().minusDays(15)).build(),

            // ─── Amrita Pritam / Punjabi ──────────────────────────────────────
            PoemDocument.builder().title("Aj Aakhaan Waris Shah Nu")
                .excerpt("Aj aakhaan Waris Shah nu, kitto qabraan vichon bol,\nTe aj kitaab-e-ishq da koi agla varka phol.")
                .content("Aj aakhaan Waris Shah nu, kitto qabraan vichon bol,\nTe aj kitaab-e-ishq da koi agla varka phol.\n\nIk roi si dhee Punjab di, tu likh likh maare wain,\nAj lakhaan dheeyan rondiyan, tenu Waris Shah nu kain.")
                .category("Punjabi Kavita").mood("Melancholy").theme("Loss").language("Punjabi")
                .tags(List.of("punjabi", "partition", "waris-shah", "amrita", "classic"))
                .author(amritas).likesCount(5419).viewsCount(21300).commentsCount(398).trendingScore(95.8)
                .createdAt(LocalDateTime.now().minusDays(90)).build(),

            PoemDocument.builder().title("Main Tenu Phir Milangi")
                .excerpt("Main tenu phir milangi\nkithe? kis tarah? pata nahin.\nShayad teri kalpna di prerna ban ke\ntere canvas te utrangi.")
                .content("Main tenu phir milangi\nkithe? kis tarah? pata nahin.\nShayad teri kalpna di prerna ban ke\ntere canvas te utrangi.\n\nShayad suraj di lao ban ke\ntere rang vich ghulke\ntere canvas de rang vichon\ntenu takia karangi.")
                .category("Kavita").mood("Romance").theme("Love").language("Punjabi")
                .tags(List.of("punjabi", "love", "reunion", "amrita", "reincarnation"))
                .author(amritas).likesCount(4876).viewsCount(19200).commentsCount(356).trendingScore(93.7)
                .createdAt(LocalDateTime.now().minusDays(120)).build(),

            PoemDocument.builder().title("Ik Si Anita")
                .excerpt("Ik si Anita jis ne apni\nZindagi di pothi fadh ke\nIk ik varak yaadon da\nSaade hathin dita.")
                .content("Ik si Anita jis ne apni\nZindagi di pothi fadh ke\nIk ik varak yaadon da\nSaade hathin dita.\n\nSaadi yaad teri, teri yaad saadi,\nYeh rishta hai hawa aur baadal da.")
                .category("Kavita").mood("Melancholy").theme("Identity").language("Punjabi")
                .tags(List.of("punjabi", "memory", "identity", "amrita"))
                .author(amritas).likesCount(2341).viewsCount(9400).commentsCount(167).trendingScore(82.3)
                .createdAt(LocalDateTime.now().minusDays(150)).build(),

            // ─── Kabir Dohas ──────────────────────────────────────────────────
            PoemDocument.builder().title("Maati Kahe Kumhar Se")
                .excerpt("Maati kahe kumhar se, tu kya roonde mohe,\nEk din aisa aayega, main roondunga tohe.")
                .content("Maati kahe kumhar se, tu kya roonde mohe,\nEk din aisa aayega, main roondunga tohe.\n\nSadhu aisa chahiye, jaisa soopa hoye,\nSaar saar ko gahi rahe, thotha de ur joye.")
                .category("Doha").mood("Philosophy").theme("Spirituality").language("Hindi")
                .tags(List.of("doha", "kabir", "philosophy", "wisdom", "classic"))
                .author(kabirs).likesCount(3876).viewsCount(15600).commentsCount(224).trendingScore(93.1)
                .createdAt(LocalDateTime.now().minusDays(200)).build(),

            PoemDocument.builder().title("Bura Jo Dekhan Main Chala")
                .excerpt("Bura jo dekhan main chala, bura na milya koy,\nJo dil khoja aapna, mujhse bura na koy.")
                .content("Bura jo dekhan main chala, bura na milya koy,\nJo dil khoja aapna, mujhse bura na koy.\n\nPothi padh padh jag mua, pandit bhaya na koy,\nDhai aakhar prem ka, padhe so pandit hoy.")
                .category("Doha").mood("Philosophy").theme("Spirituality").language("Hindi")
                .tags(List.of("doha", "kabir", "self-reflection", "wisdom", "devotion"))
                .author(kabirs).likesCount(4231).viewsCount(17100).commentsCount(287).trendingScore(94.2)
                .createdAt(LocalDateTime.now().minusDays(210)).build(),

            PoemDocument.builder().title("Chalti Chakki Dekh Ke")
                .excerpt("Chalti chakki dekh ke, diya Kabira roye,\nDui patan ke beech mein, sabut bacha na koye.")
                .content("Chalti chakki dekh ke, diya Kabira roye,\nDui patan ke beech mein, sabut bacha na koye.\n\nMaala toh kar mein phire, jeebh phire mukh maahi,\nManua toh chahun dish phire, yeh toh simran naahi.")
                .category("Doha").mood("Philosophy").theme("Spirituality").language("Hindi")
                .tags(List.of("doha", "kabir", "mortality", "time", "philosophy"))
                .author(kabirs).likesCount(2987).viewsCount(12100).commentsCount(189).trendingScore(87.9)
                .createdAt(LocalDateTime.now().minusDays(220)).build(),

            // ─── Contemporary Hindi (Priya) ───────────────────────────────────
            PoemDocument.builder().title("Shahr-e-Dil")
                .excerpt("Ek shahr basaya tha maine\ndil ki khaali zameen par,\nMohalle the yadoon ke\naur galiyan khayalon ki.")
                .content("Ek shahr basaya tha maine\ndil ki khaali zameen par,\nMohalle the yadoon ke\naur galiyan khayalon ki.\n\nAb woh shahr udaas hai,\nKyunki tu ja chuka hai,\nAur main uske khaNdaron mein\nakela bhatakta hoon.")
                .category("Nazm").mood("Melancholy").theme("Loss").language("Hindi")
                .tags(List.of("nazm", "heartbreak", "city", "memory", "contemporary"))
                .author(priyas).likesCount(2943).viewsCount(11200).commentsCount(186).trendingScore(90.4)
                .createdAt(LocalDateTime.now().minusDays(25)).build(),

            PoemDocument.builder().title("Stree Ki Aawaaz")
                .excerpt("Main woh nadi hoon\njo apni hi zaamin se\nsirf dariya banana chahti hoon,\nnaki maidaan.")
                .content("Main woh nadi hoon\njo apni hi zaamin se\nsirf dariya banana chahti hoon,\nnaki maidaan.\n\nMujhe mat bolo:\n'Beh ja jahan behe.'\nMujhse puchho:\n'Kahan jaana chahti ho?'\nMain bataaungi.")
                .category("Free Verse").mood("Rebellion").theme("Freedom").language("Hindi")
                .tags(List.of("feminism", "freedom", "contemporary", "voice", "resistance"))
                .author(priyas).likesCount(3567).viewsCount(14100).commentsCount(312).trendingScore(92.8)
                .createdAt(LocalDateTime.now().minusDays(8)).build(),

            PoemDocument.builder().title("Mitti Ki Khushboo")
                .excerpt("Pehli baarish mein\njab mitti ki khushboo uthti hai,\ntoh lagta hai jaise\ndharat ne saans li.")
                .content("Pehli baarish mein\njab mitti ki khushboo uthti hai,\ntoh lagta hai jaise\ndharat ne saans li.\n\nShahar ke betaab dil\nkisi porani yaad ki tarah\nkheton ki taraf bhagte hain,\nbasne ki chahat liye.")
                .category("Free Verse").mood("Nature").theme("Seasons").language("Hindi")
                .tags(List.of("nature", "monsoon", "rain", "petrichor", "contemporary"))
                .author(priyas).likesCount(1876).viewsCount(7800).commentsCount(134).trendingScore(83.6)
                .createdAt(LocalDateTime.now().minusDays(5)).build(),

            PoemDocument.builder().title("Shehar Ki Tanhai")
                .excerpt("Lakho logon ke beech mein\nbhi yeh dil kitna tanha hai,\nSabka saaya saath hai\nlekin apna kaun yahaan?")
                .content("Lakho logon ke beech mein\nbhi yeh dil kitna tanha hai,\nSabka saaya saath hai\nlekin apna kaun yahaan?\n\nMetro mein, bazaar mein,\nhaar jagah bheed hai,\nlekin us bheed mein\nmeri awaaz koi sunne wala nahin.")
                .category("Nazm").mood("Melancholy").theme("Identity").language("Hindi")
                .tags(List.of("urban", "loneliness", "city", "modern", "nazm"))
                .author(priyas).likesCount(2123).viewsCount(8700).commentsCount(156).trendingScore(85.2)
                .createdAt(LocalDateTime.now().minusDays(3)).build(),

            // ─── English / Bilingual (Arjun) ──────────────────────────────────
            PoemDocument.builder().title("Between Languages")
                .excerpt("I write in two tongues\nbut feel in neither—\na bridge over a river\nthat flows only in dreams.")
                .content("I write in two tongues\nbut feel in neither—\na bridge over a river\nthat flows only in dreams.\n\nUrdu on my lips\nEnglish in my mind,\nHome is the hyphen\nI carry between them.")
                .category("Free Verse").mood("Philosophy").theme("Identity").language("English")
                .tags(List.of("bilingual", "identity", "diaspora", "english", "urdu"))
                .author(arjuns).likesCount(1876).viewsCount(8900).commentsCount(134).trendingScore(87.6)
                .createdAt(LocalDateTime.now().minusDays(35)).build(),

            PoemDocument.builder().title("The Weight of Monsoon")
                .excerpt("The monsoon doesn't ask\nif you're ready.\nIt arrives with the audacity\nof an old lover.")
                .content("The monsoon doesn't ask\nif you're ready.\nIt arrives with the audacity\nof an old lover.\n\nYour windows crack open\nlike a long-held breath.\nThe city exhales\ndecades of dust and longing.")
                .category("Free Verse").mood("Nature").theme("Seasons").language("English")
                .tags(List.of("monsoon", "rain", "nature", "english", "contemporary"))
                .author(arjuns).likesCount(1543).viewsCount(6700).commentsCount(98).trendingScore(81.4)
                .createdAt(LocalDateTime.now().minusDays(18)).build(),

            PoemDocument.builder().title("Inheritance")
                .excerpt("My grandfather left me\nan Urdu dictionary\nI cannot read.\nI carry it everywhere.")
                .content("My grandfather left me\nan Urdu dictionary\nI cannot read.\nI carry it everywhere.\n\nSometimes I hold it\nthe way he must have held\nhis village—\nknowing it was lost\nbefore it was left.")
                .category("Free Verse").mood("Melancholy").theme("Identity").language("English")
                .tags(List.of("inheritance", "diaspora", "urdu", "english", "family"))
                .author(arjuns).likesCount(2187).viewsCount(9600).commentsCount(178).trendingScore(88.9)
                .createdAt(LocalDateTime.now().minusDays(22)).build(),

            PoemDocument.builder().title("Ghazal for a Lost City")
                .excerpt("I search for you in every crowded street, my city,\nYour name on my lips like an old song, my city.")
                .content("I search for you in every crowded street, my city,\nYour name on my lips like an old song, my city.\n\nThe mango trees we climbed as boys have been felled,\nCondominiums stand where you once breathed, my city.\n\nThey renamed your roads but not your soul\u2014\nI still call you home, my city.")
                .category("Ghazal").mood("Melancholy").theme("Loss").language("English")
                .tags(List.of("ghazal", "english", "city", "loss", "nostalgia"))
                .author(arjuns).likesCount(1654).viewsCount(7200).commentsCount(112).trendingScore(83.1)
                .createdAt(LocalDateTime.now().minusDays(40)).build(),

            PoemDocument.builder().title("Dusk at Marine Drive")
                .excerpt("The sea turns gold for exactly three minutes\nthen goes dark, like a government promise.\nWe come anyway, every evening,\nstill hoping.")
                .content("The sea turns gold for exactly three minutes\nthen goes dark, like a government promise.\nWe come anyway, every evening,\nstill hoping.\n\nA child licks orange lollipop.\nAn old couple argues about salt.\nSomeone cries into the wind\nand the wind doesn't mind.")
                .category("Free Verse").mood("Joy").theme("Freedom").language("English")
                .tags(List.of("mumbai", "marine-drive", "sea", "everyday", "english"))
                .author(arjuns).likesCount(2876).viewsCount(12100).commentsCount(234).trendingScore(90.7)
                .createdAt(LocalDateTime.now().minusDays(7)).build(),

            // ─── Sufi / Devotional ────────────────────────────────────────────
            PoemDocument.builder().title("Aaj Rang Hai")
                .excerpt("Aaj rang hai ri\nmere mehboob ke ghar rang hai ri,\nDil ke gulshan mein\nkhile hain gulshan hazar.")
                .content("Aaj rang hai ri\nmere mehboob ke ghar rang hai ri,\nDil ke gulshan mein\nkhile hain gulshan hazar.\n\nJab se aya hai noor-e-iman dil mein,\nTab se khil utha hai yeh chaman.")
                .category("Qawwali").mood("Devotion").theme("Spirituality").language("Urdu")
                .tags(List.of("qawwali", "sufi", "devotion", "divine-love", "urdu"))
                .author(ghalibs).likesCount(3102).viewsCount(12700).commentsCount(234).trendingScore(89.6)
                .createdAt(LocalDateTime.now().minusDays(55)).build(),

            PoemDocument.builder().title("Mera Piya Ghar Aaya")
                .excerpt("Mera piya ghar aaya,\nO ramji mera piya ghar aaya.\nBaahar gayi rut sawan ki\nandar aa gayi bhaavan ki.")
                .content("Mera piya ghar aaya,\nO ramji mera piya ghar aaya.\nBaahar gayi rut sawan ki\nandar aa gayi bhaavan ki.\n\nAngan mein phir se foothe hain phool,\nBhooli hui saari si gam aur dhool.")
                .category("Sufi").mood("Joy").theme("Love").language("Hindi")
                .tags(List.of("sufi", "love", "reunion", "joy", "devotion"))
                .author(gulzars).likesCount(2543).viewsCount(10400).commentsCount(178).trendingScore(86.3)
                .createdAt(LocalDateTime.now().minusDays(50)).build(),

            // ─── Nature / Seasons ─────────────────────────────────────────────
            PoemDocument.builder().title("Basant Bahar")
                .excerpt("Phoolon ne phir karwat li,\nSooraj ne aankhein kholi,\nMausam ne phir angdaai li—\nBasant aa gayi boli.")
                .content("Phoolon ne phir karwat li,\nSooraj ne aankhein kholi,\nMausam ne phir angdaai li—\nBasant aa gayi boli.\n\nPatton par shabhnam ke moti,\nHawa mein chandan ki khushboo,\nPanchhi gaye apne geet aaj—\nBasant ne ki apni guftagoo.")
                .category("Kavita").mood("Joy").theme("Seasons").language("Hindi")
                .tags(List.of("spring", "nature", "basant", "flowers", "joy"))
                .author(priyas).likesCount(1432).viewsCount(5800).commentsCount(87).trendingScore(78.4)
                .createdAt(LocalDateTime.now().minusDays(2)).build(),

            PoemDocument.builder().title("Patjhad Mein")
                .excerpt("Patton ka girna\nsikha deta hai ek baat:\nKhushi se chhodo jo jaana hai,\nchhode bina nayi bahar nahin aati.")
                .content("Patton ka girna\nsikha deta hai ek baat:\nKhushi se chhodo jo jaana hai,\nchhode bina nayi bahar nahin aati.\n\nJab ped nanga khada hota hai saradiyoon mein,\nWoh nahi rota, woh intezaar karta hai.\nHum bhi kaash seekh lete yeh kala.")
                .category("Free Verse").mood("Philosophy").theme("Seasons").language("Hindi")
                .tags(List.of("autumn", "nature", "philosophy", "letting-go", "hindi"))
                .author(priyas).likesCount(1876).viewsCount(7700).commentsCount(143).trendingScore(82.1)
                .createdAt(LocalDateTime.now().minusDays(12)).build(),

            // ─── Rebellion / Social ───────────────────────────────────────────
            PoemDocument.builder().title("Inquilab Zindabad")
                .excerpt("Jo toote na woh sapna kya,\nJo jhukte hain woh kadam kya.\nHum nahi roke apni zubaan\nYeh dil dhadke toh dhadke.")
                .content("Jo toote na woh sapna kya,\nJo jhukte hain woh kadam kya.\nHum nahi roke apni zubaan\nYeh dil dhadke toh dhadke.\n\nZulm ke khilaf uthegi awaaz,\nHar gali har chowk har aawaaz,\nInquilab ka sooraj nikla—\nAb andhera nahin rahega.")
                .category("Nazm").mood("Rebellion").theme("Freedom").language("Hindi")
                .tags(List.of("revolution", "freedom", "resistance", "political", "hindi"))
                .author(priyas).likesCount(4321).viewsCount(17400).commentsCount(412).trendingScore(96.2)
                .createdAt(LocalDateTime.now().minusDays(1)).build(),

            PoemDocument.builder().title("Aazaadi")
                .excerpt("Azaadi ka matlab sirf\nJhandaa nahi hota,\nAzaad hona seekhna hoga\nhum sab ko andar se.")
                .content("Azaadi ka matlab sirf\nJhandaa nahi hota,\nAzaad hona seekhna hoga\nhum sab ko andar se.\n\nJo bandhan hain mann ke\nwoh kaun todega?\nYeh inquilab baahir se nahin,\nandhar se shuru hota hai.")
                .category("Free Verse").mood("Rebellion").theme("Freedom").language("Hindi")
                .tags(List.of("freedom", "independence", "revolution", "inner-freedom"))
                .author(arjuns).likesCount(2987).viewsCount(12300).commentsCount(267).trendingScore(91.1)
                .createdAt(LocalDateTime.now().minusDays(4)).build()
        ));
        }

        // ── Subscriptions Seed ────────────────────────────────────────────────
        if (subscriptionRepository.count() == 0 && mirza != null) {
            subscriptionRepository.saveAll(List.of(
                Subscription.builder().userId(mirza.getId()).tier(Subscription.Tier.PRO).status(Subscription.Status.ACTIVE).createdAt(LocalDateTime.now().minusDays(45)).build(),
                Subscription.builder().userId(gulzar.getId()).tier(Subscription.Tier.PRO).status(Subscription.Status.ACTIVE).createdAt(LocalDateTime.now().minusDays(30)).build(),
                Subscription.builder().userId(amrita.getId()).tier(Subscription.Tier.LITE).status(Subscription.Status.ACTIVE).createdAt(LocalDateTime.now().minusDays(20)).build(),
                Subscription.builder().userId(kabir.getId()).tier(Subscription.Tier.LITE).status(Subscription.Status.ACTIVE).createdAt(LocalDateTime.now().minusDays(10)).build()
            ));
        }

        // ── Orders Seed ───────────────────────────────────────────────────────
        if (orderDocumentRepository.count() == 0) {
            orderDocumentRepository.saveAll(List.of(
                OrderDocument.builder().username("MirzaGhalib").paymentStatus("COMPLETED").totalAmount(new BigDecimal("849.00")).currency("INR")
                        .createdAt(Instant.now().minus(28, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("Divan-e-Ghalib: Collector's Edition").price(new BigDecimal("849.00")).quantity(1).build())).build(),
                OrderDocument.builder().username("Gulzar").paymentStatus("COMPLETED").totalAmount(new BigDecimal("1299.00")).currency("INR")
                        .createdAt(Instant.now().minus(24, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("The Art of the Ghazal — Masterclass").price(new BigDecimal("1299.00")).quantity(1).build())).build(),
                OrderDocument.builder().username("PriyaVerse").paymentStatus("COMPLETED").totalAmount(new BigDecimal("399.00")).currency("INR")
                        .createdAt(Instant.now().minus(19, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("Monsoon Ghazal — Fine Art Print").price(new BigDecimal("399.00")).quantity(1).build())).build(),
                OrderDocument.builder().username("ArjunMehta").paymentStatus("COMPLETED").totalAmount(new BigDecimal("299.00")).currency("INR")
                        .createdAt(Instant.now().minus(15, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("Kavyakosh Poet's Journal").price(new BigDecimal("299.00")).quantity(1).build())).build(),
                OrderDocument.builder().username("AmritaPritam").paymentStatus("COMPLETED").totalAmount(new BigDecimal("1698.00")).currency("INR")
                        .createdAt(Instant.now().minus(11, ChronoUnit.DAYS))
                        .items(List.of(
                                OrderDocument.OrderItem.builder().name("Divan-e-Ghalib: Collector's Edition").price(new BigDecimal("849.00")).quantity(2).build()
                        )).build(),
                OrderDocument.builder().username("KabirDas").paymentStatus("COMPLETED").totalAmount(new BigDecimal("1299.00")).currency("INR")
                        .createdAt(Instant.now().minus(7, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("The Art of the Ghazal — Masterclass").price(new BigDecimal("1299.00")).quantity(1).build())).build(),
                OrderDocument.builder().username("PriyaVerse").paymentStatus("COMPLETED").totalAmount(new BigDecimal("698.00")).currency("INR")
                        .createdAt(Instant.now().minus(3, ChronoUnit.DAYS))
                        .items(List.of(
                                OrderDocument.OrderItem.builder().name("Monsoon Ghazal — Fine Art Print").price(new BigDecimal("399.00")).quantity(1).build(),
                                OrderDocument.OrderItem.builder().name("Kavyakosh Poet's Journal").price(new BigDecimal("299.00")).quantity(1).build()
                        )).build(),
                OrderDocument.builder().username("ArjunMehta").paymentStatus("COMPLETED").totalAmount(new BigDecimal("849.00")).currency("INR")
                        .createdAt(Instant.now().minus(1, ChronoUnit.DAYS))
                        .items(List.of(OrderDocument.OrderItem.builder().name("Divan-e-Ghalib: Collector's Edition").price(new BigDecimal("849.00")).quantity(1).build())).build()
            ));
        }

        // ── Comments Seed ─────────────────────────────────────────────────────
        if (commentDocumentRepository.count() == 0) {
            List<PoemDocument> seededPoems = poemDocumentRepository.findAll();
            if (!seededPoems.isEmpty()) {
                String firstPoemId = seededPoems.get(0).getId();
                String secondPoemId = seededPoems.size() > 1 ? seededPoems.get(1).getId() : firstPoemId;
                String thirdPoemId = seededPoems.size() > 2 ? seededPoems.get(2).getId() : firstPoemId;

                commentDocumentRepository.saveAll(List.of(
                    CommentDocument.builder().poemId(firstPoemId).username("Gulzar").content("Ghalib's depth in this couplet is unmatched. The longing in these lines cuts straight through the soul.")
                            .createdAt(Instant.now().minus(26, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(firstPoemId).username("PriyaVerse").content("The rhyme structure and musicality in the second stanza is breathtaking. Wah wah!")
                            .createdAt(Instant.now().minus(22, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(secondPoemId).username("MirzaGhalib").content("Such poignant simplicity. Words that capture the quiet longing of an evening.")
                            .createdAt(Instant.now().minus(17, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(secondPoemId).username("AmritaPritam").content("Reminds me of rainy evenings by the window. Truly evocative.")
                            .createdAt(Instant.now().minus(13, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(thirdPoemId).username("ArjunMehta").content("A masterclass in lyrical restraint and emotional resonance.")
                            .createdAt(Instant.now().minus(8, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(firstPoemId).username("KabirDas").content("Dhai aakhar prem ka padhe so pandit hoy... Pure wisdom.")
                            .createdAt(Instant.now().minus(4, ChronoUnit.DAYS)).build(),
                    CommentDocument.builder().poemId(secondPoemId).username("PriyaVerse").content("Incredible imagery in the closing lines! Loved reading this.")
                            .createdAt(Instant.now().minus(1, ChronoUnit.DAYS)).build()
                ));
            }
        }

        // ── Review Requests Seed ──────────────────────────────────────────────
        if (reviewRequestRepository.count() == 0) {
            reviewRequestRepository.saveAll(List.of(
                ReviewRequestDocument.builder().poemTitle("Hazaaron Khwahishen Aisi").authorUsername("MirzaGhalib").reviewerUsername("PriyaVerse")
                        .status("COMPLETED").overallScore(9.6).emotionScore(10).creativityScore(9).rhythmScore(10).imageryScore(9).symbolismScore(10)
                        .reviewerFeedback("Masterpiece of Urdu ghazal tradition. Rhyme and metre are flawless.")
                        .createdAt(Instant.now().minus(25, ChronoUnit.DAYS)).reviewedAt(Instant.now().minus(24, ChronoUnit.DAYS)).build(),
                ReviewRequestDocument.builder().poemTitle("Tere Bina Zindagi Se").authorUsername("Gulzar").reviewerUsername("PriyaVerse")
                        .status("COMPLETED").overallScore(9.4).emotionScore(10).creativityScore(9).rhythmScore(9).imageryScore(10).symbolismScore(9)
                        .reviewerFeedback("Heartfelt lyrical simplicity with profound nostalgic resonance.")
                        .createdAt(Instant.now().minus(20, ChronoUnit.DAYS)).reviewedAt(Instant.now().minus(19, ChronoUnit.DAYS)).build(),
                ReviewRequestDocument.builder().poemTitle("Aj Aakhaan Waris Shah Nu").authorUsername("AmritaPritam").reviewerUsername("Editorial Board")
                        .status("COMPLETED").overallScore(9.8).emotionScore(10).creativityScore(10).rhythmScore(10).imageryScore(9).symbolismScore(10)
                        .reviewerFeedback("A historic cultural lament. Tremendous visceral impact.")
                        .createdAt(Instant.now().minus(15, ChronoUnit.DAYS)).reviewedAt(Instant.now().minus(14, ChronoUnit.DAYS)).build(),
                ReviewRequestDocument.builder().poemTitle("Between Languages").authorUsername("ArjunMehta").reviewerUsername("PriyaVerse")
                        .status("COMPLETED").overallScore(8.8).emotionScore(9).creativityScore(9).rhythmScore(8).imageryScore(9).symbolismScore(9)
                        .reviewerFeedback("Exceptional bilingual sensibility exploring the hyphenated self.")
                        .createdAt(Instant.now().minus(10, ChronoUnit.DAYS)).reviewedAt(Instant.now().minus(9, ChronoUnit.DAYS)).build(),
                ReviewRequestDocument.builder().poemTitle("Shahr-e-Dil").authorUsername("PriyaVerse").reviewerUsername("Editorial Board")
                        .status("IN_REVIEW").emotionScore(9).creativityScore(8).rhythmScore(9).imageryScore(9).symbolismScore(8)
                        .createdAt(Instant.now().minus(5, ChronoUnit.DAYS)).build(),
                ReviewRequestDocument.builder().poemTitle("Monsoon Muses Contest Entry").authorUsername("ArjunMehta").reviewerUsername("PriyaVerse")
                        .status("COMPLETED").overallScore(9.1).emotionScore(9).creativityScore(9).rhythmScore(9).imageryScore(10).symbolismScore(9)
                        .reviewerFeedback("Lush imagery of rain on rooftops and vintage nostalgia.")
                        .createdAt(Instant.now().minus(2, ChronoUnit.DAYS)).reviewedAt(Instant.now().minus(1, ChronoUnit.DAYS)).build()
            ));
        }

        // ── Poem Interactions (Likes) Seed ────────────────────────────────────
        if (poemInteractionRepository.count() == 0) {
            List<PoemDocument> seededPoems = poemDocumentRepository.findAll();
            if (!seededPoems.isEmpty()) {
                String p1 = seededPoems.get(0).getId();
                String p2 = seededPoems.size() > 1 ? seededPoems.get(1).getId() : p1;
                poemInteractionRepository.saveAll(List.of(
                    PoemInteractionDocument.builder().username("Gulzar").poemId(p1).liked(true).updatedAt(Instant.now().minus(25, ChronoUnit.DAYS)).build(),
                    PoemInteractionDocument.builder().username("AmritaPritam").poemId(p1).liked(true).updatedAt(Instant.now().minus(20, ChronoUnit.DAYS)).build(),
                    PoemInteractionDocument.builder().username("PriyaVerse").poemId(p1).liked(true).updatedAt(Instant.now().minus(15, ChronoUnit.DAYS)).build(),
                    PoemInteractionDocument.builder().username("ArjunMehta").poemId(p2).liked(true).updatedAt(Instant.now().minus(10, ChronoUnit.DAYS)).build(),
                    PoemInteractionDocument.builder().username("KabirDas").poemId(p2).liked(true).updatedAt(Instant.now().minus(5, ChronoUnit.DAYS)).build(),
                    PoemInteractionDocument.builder().username("SystemAdmin").poemId(p1).liked(true).updatedAt(Instant.now().minus(1, ChronoUnit.DAYS)).build()
                ));
            }
        }
    }
}
