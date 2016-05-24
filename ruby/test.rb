
# dynamic query

def dynamic_query(phone_input)

    ### START ###

    sql_text = "SELECT * FROM customers WHERE phone = '#{phone_input}';"

    #### END ####

end



# prepared statement

def prepared_statement(phone_input)

    ### START ###

    require 'Mysql2'

    # connect to the database
    client = Mysql2::Client.new(:host => 'localhost', :username => 'root')
    client.select_db('bakery')

    # prepare the statement
    statement = client.prepare("SELECT * FROM customers WHERE phone = ?")

    # execute the statement and pass the parameter value
    result = statement.execute(phone_input)

    #### END ####

end



# phone validation

### START ###

def is_valid_phone(phone_input)

    # contains only valid phone characters
    if /[^0-9()-. ]/.match(phone_input)
        return false
    end

    # has exactly 10 digits
    if phone_input.gsub(/[^0-9]/, '').length != 10
        return false
    end

    return true
end

#### END ####



# escape string method

### START ###

def escape_string_manually(phone_input)

    # escape backslashes first so we don't escape the
    # backslashes we'll add to escape other special characters
    phone_input = phone_input.gsub("\\", "\\\\\\")

    char_to_replacement = {
        "\0" => "\\\\0",
        "\n" => "\\n",
        "\r" => "\\r",
        "'"  => "\\\\'",
        "\"" => "\\\"",
    }

    char_to_replacement.each do |char_to_replace, replacement|
        next if not phone_input.include? char_to_replace
        phone_input = phone_input.gsub(char_to_replace, replacement)
    end

    return phone_input
end

#### END ####

def escape_string_built_in(phone_input)

    ### START ###

    require 'Mysql2'

    # client = Mysql2::Client.new(:host => 'localhost', :username => 'test')
    client = Mysql2::Client

    phone_param = client.escape(phone_input)

    #### END ####

end



# escape string example

                        ### START ###
escaped_string_result = "SELECT * FROM customers WHERE phone = '1\\' OR 1=1;--';"
                        #### END ####



# TESTS

clean_input = "8015550198"

malicious_input = "1' OR 1=1;--"

characters_to_escape = "\0\n\r'\"\\"


def print_test(condition)
    puts condition ? "\tok" : "\tFAIL"
end


puts "\nbuilds dynamic queries..."

print_test(dynamic_query(clean_input) == "SELECT * FROM customers WHERE phone = '8015550198';")
print_test(dynamic_query(malicious_input) == "SELECT * FROM customers WHERE phone = '1' OR 1=1;--';")


puts "\nbuilds prepared statement..."

# prepared_statement(clean_input)
puts "\t-"

puts "\nvalidates phones..."

print_test(is_valid_phone(clean_input))
print_test(is_valid_phone("(803) 444-3332"))
print_test(is_valid_phone("803.444.3332"))

print_test(!is_valid_phone("(803) 444-33312"))
print_test(!is_valid_phone("(803) 444-333s"))
print_test(!is_valid_phone(malicious_input))


puts "\nmanually escapes strings..."

print_test(escape_string_manually("dont escape me") == "dont escape me")
print_test(escape_string_manually(characters_to_escape) == "\\0\\n\\r\\'\\\"\\\\")


puts "\nbuilt in method escapes strings..."

print_test(escape_string_built_in("dont escape me") == "dont escape me")
print_test(escape_string_built_in(characters_to_escape) == "\\0\\n\\r\\'\\\"\\\\")


puts "\nescape methods aren't in place..."

string_before = "test\0\n\r'"
print_test(escape_string_manually(string_before) != string_before)

string_before = "test\0\n\r'"
print_test(escape_string_built_in(string_before) != string_before)


puts "\nexample escaped string is correct..."

print_test(dynamic_query(escape_string_manually(malicious_input)) == escaped_string_result)
print_test(dynamic_query(escape_string_built_in(malicious_input)) == escaped_string_result)


puts "\ndone!\n\n"



def test_escape

    chars = ["\0", "'", "\"", "\b", "\n", "\r", "\t", "\\", "%", "_"];

    chars.each do |char|
        puts "[#{char}] > [#{Mysql2::Client.escape(char)}]"
    end
end

# test_escape()

# [] > [\0]
# ['] > [\']
# ["] > [\"]
# ] > ]
# [
# ] > [\n]
# ] > [\r]
# [   ] > [   ]
# [\] > [\\]
# [%] > [%]
# [_] > [_]
