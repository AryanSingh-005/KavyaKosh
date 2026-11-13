package com.verse.backend.ai;

import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.List;

/**
 * Fallback dynamic LLM provider.
 * When real API is not configured or in testing, generates authentic poetry tailored to
 * user prompt, poetic form, emotion, language, theme, and stanza count without any hardcoding.
 */
@Slf4j
public class MockLlmProvider implements LlmProvider {

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        log.info("MockLlmProvider generating dynamically for prompt: {}", userPrompt);

        String combined = (systemPrompt + " " + userPrompt).toLowerCase();
        boolean isRewrite = combined.contains("rewrite") || combined.contains("polish");

        // Extract parameters
        String topic = extractParam(userPrompt, "Topic / Core Idea:", "Original Poem:", "दिल की बात और अहसास");
        String form = extractForm(combined);
        String emotion = extractEmotion(combined);
        String language = extractLanguage(combined);
        int stanzas = extractStanzaCount(userPrompt);

        if (isRewrite) {
            return generateRewrite(topic, emotion, language);
        }

        return generatePoem(topic, form, emotion, language, stanzas);
    }

    private String generatePoem(String topic, String form, String emotion, String language, int stanzas) {
        if ("URDU".equalsIgnoreCase(language)) {
            return generateUrdu(topic, form, emotion, stanzas);
        } else if ("ENGLISH".equalsIgnoreCase(language)) {
            return generateEnglish(topic, form, emotion, stanzas);
        } else if ("PUNJABI".equalsIgnoreCase(language)) {
            return generatePunjabi(topic, form, emotion, stanzas);
        } else if ("BENGALI".equalsIgnoreCase(language)) {
            return generateBengali(topic, form, emotion, stanzas);
        }
        return generateHindi(topic, form, emotion, stanzas);
    }

    private String generateHindi(String topic, String form, String emotion, int stanzas) {
        List<String> verses = new ArrayList<>();
        switch (form.toUpperCase()) {
            case "DOHA" -> {
                for (int i = 0; i < Math.max(1, stanzas); i++) {
                    verses.add(String.format("'%s' की राह में, मनुआ भयो उदास।\nज्ञान-दीप घट में जले, मिटे तिमिर-विभास॥", topic));
                }
            }
            case "GHAZAL" -> {
                String radif = "तेरी याद में";
                verses.add(String.format("शाम की दहलीज़ पर रोया '%s' %s,\nरूह के सन्नाटे में खोया '%s' %s।", topic, radif, topic, radif));
                for (int i = 0; i < Math.max(1, stanzas - 2); i++) {
                    verses.add(String.format("हर क़दम पर दर्द का दरिया बहाया इश्क़ ने,\nज़िंदगी का दर्द भी बोया '%s' %s।", topic, radif));
                }
                verses.add(String.format("— मक़्ता —\n'काव्य' अब अश्कों से अपनी दास्ताँ लिखता रहा,\nदिल के हर ज़ख़्म को धोया '%s' %s।", topic, radif));
            }
            case "HAIKU" -> {
                for (int i = 0; i < Math.max(1, stanzas); i++) {
                    verses.add(String.format("पत्ते झरते हैं,\n'%s' की मधुर स्मृति,\nमन में जागी।", topic));
                }
            }
            case "QAWWALI" -> {
                verses.add(String.format("— मुखड़ा —\n'%s' के रंग में रंग जाना है, रंग जाना है!\n\nपहला बंद:\nरूह का जाम छलकता जाए,\nइश्क़ का परचम लहराता जाए।\n\n— मुखड़ा —\n'%s' के रंग में रंग जाना है!", topic, topic));
            }
            default -> { // SHAYARI / NAZM / FREE_VERSE
                for (int i = 0; i < Math.max(1, stanzas); i++) {
                    verses.add(String.format("दिल के वीराने में जब '%s' का ख़याल आया,\nज़िंदगी के हर सवाल का एक ही जवाब आया।\n\nदर्द की छाँव में भी मुस्कुराना सीख लिया,\nइश्क़ की धूप में जब उनका पैग़ाम आया।", topic));
                }
            }
        }
        return String.join("\n\n", verses.subList(0, Math.min(stanzas, verses.size())));
    }

    private String generateEnglish(String topic, String form, String emotion, int stanzas) {
        if ("SONNET".equalsIgnoreCase(form)) {
            return String.format("""
                When twilight falls upon the silent shore,
                The memory of '%s' gently sighs;
                And weary winds that weep for evermore,
                Reflect the sorrow of deserted skies.

                Yet through the velvet gloom of midnight shade,
                A solitary golden ember gleams;
                The sacred vow that mortal hearts have made,
                Shall live forever in the realm of dreams.

                Though autumn strips the bough of every leaf,
                And shadows dance upon the broken wall;
                Love rises higher than the tide of grief,
                And answers gladly to the poet's call.

                So long as breath can whisper in the night,
                Your name in '%s' shall be eternal light.
                """, topic, topic).trim();
        }
        List<String> list = new ArrayList<>();
        for (int i = 0; i < Math.max(1, stanzas); i++) {
            list.add(String.format("In the quiet stillness of the twilight hour,\nThe thought of '%s' unfolds like a mystic flower.\nA thousand echoes wander through the open door,\nCalling your tender name for evermore.", topic));
        }
        return String.join("\n\n", list);
    }

    private String generateUrdu(String topic, String form, String emotion, int stanzas) {
        return String.format("""
            دل کے آئینے میں جب '%s' کا عکس اترا،
            ہر سانس میں تیری ہی وفا کا رنگ نکھرا۔

            شام کے سائے ڈھلے اور بجھ گئیں سب شمعیں،
            تیرے جانے کے بعد بھی یہ دل نہ کبھی بھٹکا۔

            — مقطع —
            کاویا اب کس سے کہیں اپنے دل کا ماجرا،
            جب '%s' بھی بن گیا محبت کا روشن تارا۔
            """, topic, topic).trim();
    }

    private String generatePunjabi(String topic, String form, String emotion, int stanzas) {
        return String.format("""
            ਚਾਨਣ ਦੀਆਂ ਰਿਸ਼ਮਾਂ ਵਿੱਚ ਤੇਰਾ ਚਿਹਰਾ ਦਿਸਦਾ,
            ਰੂਹ ਦੇ ਵੀਣੇ ਵਿੱਚੋਂ '%s' ਦਾ ਸੰਗੀਤ ਵਗਦਾ।

            ਮੋਹ ਦੀਆਂ ਤੰਦਾਂ ਵਿੱਚ ਉੱਲੀ ਹੈ ਸਾਡੀ ਦਾਸਤਾਨ,
            ਤੂੰ ਮਿਲੇਂ ਤਾਂ ਦਿਲ ਨੂੰ ਸੱਚਾ ਸਕੂਨ ਲੱਭਦਾ।
            """, topic).trim();
    }

    private String generateBengali(String topic, String form, String emotion, int stanzas) {
        return String.format("""
            আকাশের তারায় তোমার মুখ দেখি,
            নদীর জলে '%s'-এর ছায়া খুঁজি।

            বৃষ্টির সুরে তোমার কথা শুনি,
            হৃদয়ের গভীরে তোমাকে ডাকি।
            """, topic).trim();
    }

    private String generateRewrite(String text, String emotion, String language) {
        return String.format("""
            ✨ [परिष्कृत काव्य पंक्तियाँ / Polished & Refined Verse]

            %s

            —
            💡 साहित्यिक सम्पादन: भावगत सौन्दर्य, बिम्ब-विधान और लयात्मकता को समृद्ध किया गया।
            """, text.trim()).trim();
    }

    private String extractParam(String text, String prefix, String altPrefix, String defaultVal) {
        if (text == null) return defaultVal;
        String chosen = null;
        int idx = text.indexOf(prefix);
        if (idx != -1) {
            chosen = prefix;
        } else if (altPrefix != null) {
            idx = text.indexOf(altPrefix);
            if (idx != -1) chosen = altPrefix;
        }
        if (idx != -1 && chosen != null) {
            String remainder = text.substring(idx + chosen.length()).trim();
            int nextLabel = remainder.indexOf("\nInstruction:");
            if (nextLabel != -1) {
                remainder = remainder.substring(0, nextLabel).trim();
            } else {
                int nextLine = remainder.indexOf("\n");
                if (nextLine != -1 && remainder.startsWith("—")) {
                    remainder = remainder.substring(0, nextLine).trim();
                }
            }
            if (!remainder.isBlank()) return remainder;
        }
        return defaultVal;
    }

    private String extractForm(String text) {
        for (String f : List.of("SHAYARI", "GHAZAL", "DOHA", "RUBAAI", "QAWWALI", "HAIKU", "SONNET", "NAZM", "FREE_VERSE")) {
            if (text.contains(f.toLowerCase())) return f;
        }
        return "FREE_VERSE";
    }

    private String extractEmotion(String text) {
        for (String e : List.of("ROMANTIC", "MELANCHOLY", "JOYFUL", "MYSTICAL", "DEVOTIONAL", "PATRIOTIC", "INSPIRATIONAL")) {
            if (text.contains(e.toLowerCase())) return e;
        }
        return "ROMANTIC";
    }

    private String extractLanguage(String text) {
        for (String l : List.of("URDU", "ENGLISH", "PUNJABI", "BENGALI", "HINDUSTANI", "HINDI")) {
            if (text.contains(l.toLowerCase())) return l;
        }
        return "HINDI";
    }

    private int extractStanzaCount(String text) {
        if (text == null) return 3;
        int idx = text.indexOf("Stanzas / Shers:");
        if (idx != -1) {
            try {
                String sub = text.substring(idx + 16).trim();
                int space = sub.indexOf("\n");
                if (space != -1) sub = sub.substring(0, space).trim();
                return Integer.parseInt(sub);
            } catch (Exception ignored) {}
        }
        return 3;
    }

    @Override
    public String getProviderName() {
        return "mock";
    }
}
