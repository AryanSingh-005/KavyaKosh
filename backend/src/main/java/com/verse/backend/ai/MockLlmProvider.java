package com.verse.backend.ai;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MockLlmProvider implements LlmProvider {

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        log.info("MockLlmProvider generating for prompt: {}", userPrompt);

        String s = systemPrompt.toLowerCase() + " " + userPrompt.toLowerCase();

        if (s.contains("rewrite") || s.contains("polish")) return mockRewrite();
        if (s.contains("shayari") || s.contains("sher")) return mockShayari();
        if (s.contains("ghazal"))  return mockGhazal();
        if (s.contains("doha"))    return mockDoha();
        if (s.contains("rubaai") || s.contains("rubā")) return mockRubaai();
        if (s.contains("qawwali")) return mockQawwali();
        if (s.contains("haiku"))   return mockHaiku();
        if (s.contains("sonnet"))  return mockSonnet();
        if (s.contains("punjabi")) return mockPunjabi();
        if (s.contains("bengali")) return mockBengali();
        return mockNazm();
    }

    private String mockShayari() {
        return """
            दिल के दर्पण में तेरी सूरत उतर आई है,
            जैसे चाँद की रोशनी रात में बिखर जाती है।

            तेरी याद का सिलसिला रुकता नहीं कभी,
            जैसे दरिया का पानी पत्थर से गुज़र जाता है।

            ग़म को भी हमने गले से लगाया है यारों,
            इश्क़ में हर ज़ख़्म एक ज़ेवर बन जाता है।
            """;
    }

    private String mockGhazal() {
        return """
            शाम के धुंधलके में तेरी याद आती है,
            रूह के एकांत में तेरी याद आती है।

            बुझे हुए चिराग़ों की लौ फिर जल उठती है,
            जब आँखें मूँदूँ तो तेरी याद आती है।

            सहरा की रेत पर जो नक़्श छोड़ गए थे तुम,
            हर आँधी के बाद भी तेरी याद आती है।

            ये शहर, ये गलियाँ, ये रोशन बाज़ार सब,
            हर मोड़ पर, हर पल तेरी याद आती है।

            — मक़्ता —
            'काव्य' ने लिखी है ये ग़ज़ल अश्कों की स्याही से,
            क़लम उठाते ही तेरी याद आती है।
            """;
    }

    private String mockDoha() {
        return """
            माटी कहे कुम्हार से, तू क्या रौंदे मोय।
            एक दिन ऐसा आएगा, मैं रौंदूँगी तोय॥

            बड़ा हुआ तो क्या हुआ, जैसे पेड़ खजूर।
            पंथी को छाया नहीं, फल लागे अति दूर॥

            जो तोको काँटा बुवै, ताहि बोव तू फूल।
            तोहि फूल को फूल है, वाको है तिरसूल॥
            """;
    }

    private String mockRubaai() {
        return """
            ज़िंदगी एक सफ़र है, मंज़िल कोई नहीं,
            हर राह पर बिछी है ख़ुशी और ग़म की लकीर।
            जो लम्हा मिला है, उसे थाम के रख ज़रा,
            कल का कोई भरोसा नहीं, ये वक़्त है बेज़मीर।

            शराब-ए-इश्क़ पी ली हमने एक जाम में,
            होश उड़ गए, दिल डूब गया उस नाम में।
            न मस्जिद की ज़रूरत, न मंदिर की तलाश,
            ख़ुदा मिल गया हमें उसकी एक मुस्कान में।
            """;
    }

    private String mockQawwali() {
        return """
            — मुखड़ा —
            तेरे इश्क़ में डूब जाना है, डूब जाना है।

            पहला बंद:
            ये दिल का मयख़ाना खुला है आज,
            पी लो जाम-ए-मोहब्बत आज।
            हर साँस में तेरा नाम है,
            हर धड़कन में तेरा काम है।

            — मुखड़ा —
            तेरे इश्क़ में डूब जाना है, डूब जाना है।

            दूसरा बंद:
            सूफ़ी की राह पर चल पड़े हम,
            दुनिया की परवाह छोड़ दी हमने।
            तू ही मेरा क़िबला, तू ही मेरी काबा,
            तेरे दर पे सर झुका दिया हमने।

            — मुखड़ा —
            तेरे इश्क़ में डूब जाना है, डूब जाना है।
            """;
    }

    private String mockNazm() {
        return """
            चाँदनी रात में खामोश है सहरा सारा,
            हर सितारा है तेरी याद की शम्आ जैसा।

            आँसुओं से लिखी नज़्में भी मुस्कुरा उठीं,
            जब तेरा नाम हवाओं ने पुकारा जैसा।

            दश्त की रेत पे सिमटी है हया की तहरीर,
            इश्क़ बाक़ी है ज़माने में ख़ुदा की तरह।
            """;
    }

    private String mockHaiku() {
        return """
            पत्ते झरते हैं
            नदी बहती चुपचाप
            यादें रह जाती

            चाँद की रोशनी
            पानी पर काँपती है
            दिल भी काँपता
            """;
    }

    private String mockSonnet() {
        return """
            When twilight drapes the ancient city's spires,
            And jasmine scents drift through the evening air,
            My heart, like incense smoke, in longing fires,
            For one whose absence fills me with despair.

            The river hums the verses that we wrote,
            On stolen evenings by the temple gate,
            Each ripple carries fragments of a note,
            A melody that time cannot abate.

            Yet love, like monsoon, breaks through every wall,
            And floods the parched and cracking earth below,
            No fortress built by pride can stop its fall,
            No winter cold enough to stop its glow.

            So let me write your name in morning dew,
            For every dawn I wake, I wake for you.
            """;
    }

    private String mockPunjabi() {
        return """
            ਚਾਨਣ ਦੀਆਂ ਰਿਸ਼ਮਾਂ ਵਿੱਚ ਤੇਰਾ ਚਿਹਰਾ ਦਿਸਦਾ,
            ਰੂਹ ਦੇ ਵੀਣੇ ਵਿੱਚੋਂ ਮਿੱਠਾ ਸੰਗੀਤ ਵਗਦਾ।

            ਮੋਹ ਦੀਆਂ ਤੰਦਾਂ ਵਿੱਚ ਉੱਲੀ ਹੈ ਸਾਡੀ ਦਾਸਤਾਨ,
            ਤੂੰ ਮਿਲੇਂ ਤਾਂ ਦਿਲ ਨੂੰ ਸੱਚਾ ਸਕੂਨ ਲੱਭਦਾ।
            """;
    }

    private String mockBengali() {
        return """
            আকাশের তারায় তোমার মুখ দেখি,
            নদীর জলে তোমার ছায়া খুঁজি।

            বৃষ্টির সুরে তোমার কথা শুনি,
            হৃদয়ের গভীরে তোমাকে ডাকি।
            """;
    }

    private String mockRewrite() {
        return """
            [Refined & Elevated Version]

            সোনার আলোয় ভোরের মেঘ ভাঙে,
            মখমল নীরবতা শ্বাস নেয় আলতো।

            আর গতকালের ভার বহন করে না এই মন,
            আত্মা নাচে যখন ছায়ারা দুলে যায়।
            """;
    }

    @Override
    public String getProviderName() {
        return "mock";
    }
}
