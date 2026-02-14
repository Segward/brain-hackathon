package backend;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public final class IO {

    private IO() {}

    public static String readRulesAndPolicy() throws IOException {
        String rules = readResource("rules.txt");
        String policy = readResource("policy.txt");
        return combine(rules, policy);
    }

    private static String readResource(String fileName) throws IOException {
        try (InputStream is = IO.class.getClassLoader().getResourceAsStream(fileName)) {
            if (is == null) {
                throw new IOException("Resource not found: " + fileName);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static String combine(String rules, String policy) {
      return rules + "\n\n" + policy;
    }
}
