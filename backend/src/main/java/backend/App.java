package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class App {

    public static void main(String[] args) {

        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            Dotenv dotenv = Dotenv.load();
            System.setProperty("OPENAI_API_KEY", dotenv.get("OPENAI_API_KEY"));
        } else {
            System.setProperty("OPENAI_API_KEY", apiKey);
        }
        SpringApplication.run(App.class, args);

    }
}
