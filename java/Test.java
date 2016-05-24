
import java.util.regex.Pattern;
import java.util.Map;
import java.util.HashMap;

class Test {

    // dynamic query

    public static String dynamicQuery(String phoneInput) {

        /// START ///

        String sqlText = "SELECT * FROM customers WHERE phone = '" + phoneInput + "';";

        //// END ////

        return sqlText;
    }



    // prepared statement

    public static void preparedStatement(String phoneInput) {

        /// START ///

        // String statement = "SELECT * FROM customer WHERE phone = ?";

        // PreparedStatement preparedStatement = connection.prepareStatement(statement);

        // // the first argument in setter functions is an integer n
        // // corresponding to the nth ? in the statement
        // preparedStatement.setString(1, inputPhone);

        // ResultSet results = preparedStatement.executeQuery();

        //// END ////
    }



    // phone validation

    /// START ///

    // import java.util.regex.Pattern;

    public static boolean isValidPhone(String phoneInput) {

        // contains only valid phone characters
        if (Pattern.matches("[^0-9()-. ]", phoneInput)) {
            return false;
        }

        // has exactly 10 digits
        if (phoneInput.replaceAll("[^0-9]", "").length() != 10) {
            return false;
        }

        return true;
    }

    //// END ////



    // escape string method

    /// START ///

    // import java.util.Map;
    // import java.util.HashMap;

    public static String escapeStringManually(String phoneInput) {

        // escape backslashes first so we don't escape the
        // backslashes we'll add to escape other special characters
        phoneInput = phoneInput.replace("\\", "\\\\");

        Map<String, String> charToReplacement = new HashMap<String, String>();
        charToReplacement.put("\0", "\\0");
        charToReplacement.put("\n", "\\n");
        charToReplacement.put("\r", "\\r");
        charToReplacement.put("'", "\\'");
        charToReplacement.put("\"", "\\\"");

        for (Map.Entry<String, String> entry : charToReplacement.entrySet()) {
            String charToReplace = entry.getKey();
            String replacement = entry.getValue();

            if (!phoneInput.contains(charToReplace)) continue;
            phoneInput = phoneInput.replace(charToReplace, replacement);
        }

        return phoneInput;
    }

    //// END ////

    public static void escapeStringBuiltIn(String phoneInput) {

        /// START ///

        // used to have
        // but removed in lang3
        // This was a misleading method, only handling the simplest of possible SQL cases. As SQL is not Lang's focus, it didn't make sense to maintain this method.
        // https://commons.apache.org/proper/commons-lang/article3_0.html

        // import org.apache.commons.lang.StringEscapeUtils;

        // String phoneParam = StringEscapeUtils.escapeSql(phoneInput);

        //// END ////

        // return phoneParam;
    }

    public static void printTest(Boolean condition) {
        System.out.println(condition ? "\tok" : "\tFAIL");
    }

    /*
    public static void testEscape() {

        String[] chars = new String[]{"\0", "'", "\"", "\b", "\n", "\r", "\t", "\\", "%", "_"};

        for (int i = 0; i < chars.length; i++) {
            char c = chars[i];
            System.out.println(String.format("[%s] > [%s]", c, StringEscapeUtils.escapeSql(c)));
        }
    }
    */

    public static void main(String[] args) {

        Test t = new Test();



        // escape string example

                                     /// START ///
        String escapedStringResult = "SELECT * FROM customers WHERE phone = '1\\' OR 1=1;--';";
                                     //// END ////



        // TESTS

        String cleanInput = "8015550198";

        String maliciousInput = "1' OR 1=1;--";

        String charactersToEscape = "\0\n\r'\"\\";


        System.out.println("\nbuilds dynamic queries...");

        printTest(dynamicQuery(cleanInput).equals("SELECT * FROM customers WHERE phone = '8015550198';"));
        printTest(dynamicQuery(maliciousInput).equals("SELECT * FROM customers WHERE phone = '1' OR 1=1;--';"));


        System.out.println("\nbuilds prepared statement...");

        // prepared_statement(cleanInput)
        System.out.println("\t-");

        System.out.println("\nvalidates phones...");

        printTest(isValidPhone(cleanInput));
        printTest(isValidPhone("(803) 444-3332"));
        printTest(isValidPhone("803.444.3332"));

        printTest(!isValidPhone("(803) 444-33312"));
        printTest(!isValidPhone("(803) 444-333s"));
        printTest(!isValidPhone(maliciousInput));


        System.out.println("\nmanually escapes strings...");

        printTest(escapeStringManually("dont escape me").equals("dont escape me"));
        printTest(escapeStringManually(charactersToEscape).equals("\\0\\n\\r\\'\\\"\\\\"));


        System.out.println("\nbuilt in method escapes strings...");
        System.out.println("\t-");


        System.out.println("\nescape methods aren't in place...");

        String stringBefore = "test\0\n\r'";
        printTest(escapeStringManually(stringBefore) != stringBefore);


        System.out.println("\nexample escaped string is correct...");
        printTest(dynamicQuery(escapeStringManually(maliciousInput)).equals(escapedStringResult));

        System.out.println("\ndone!\n\n");
    }
}
