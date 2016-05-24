
# dynamic query

def dynamic_query(phone_input):

    ### START ###

    sql_text = "SELECT * FROM customers WHERE phone = '%s';" % phone_input

    #### END ####

    return sql_text



# prepared statement

def prepared_statement(phone_input):

    ### START ###

    import mysql.connector

    # connect to the database and instantiate a cursor
    cnx = mysql.connector.connect(database='bakery')
    cursor = cnx.cursor(prepared=True)

    statement = "SELECT * FROM customers WHERE phone = ?"

    # execute the statement with a list holding a value for each parameter
    cursor.execute(statement, (phone_input,))

    #### END ####

    return cursor.fetchone()



# stored procedure

def stored_procedure(phone_input):

    ### START ###

    import mysql.connector

    # connect to the database and instantiate a cursor
    cnx = mysql.connector.connect(database='bakery')
    cursor = cnx.cursor()

    # execute the procedure with a list of args holding a value for each parameter
    cursor.callproc('get_customer_from_phone', args=(phone_input,))

    #### END ####

    for result in cursor.stored_results():
        return result.fetchone()



# phone validation

### START ###

import re

def is_valid_phone(phone_input):

    # contains only valid phone characters
    if re.compile('[^0-9()-. ]').search(phone_input):
        return False

    # has exactly 10 digits
    if len(re.sub('[^0-9]', '', phone_input)) != 10:
        return False

    return True

#### END ####



# escape string method

### START ###

def escape_string_manually(phone_input):

    char_replacements = [
        # we have to escape backslashes first so we don't escape the
        # backslashes we'll add to escape other special characters
        ('\\', '\\\\'),
        ('\0', '\\0'),
        ('\n', '\\n'),
        ('\r', '\\r'),
        ('\'', '\\\''),
        ('"', '\\"'),
    ]

    for char_to_replace, replacement in char_replacements:
        if char_to_replace not in phone_input:
            continue
        phone_input = phone_input.replace(char_to_replace, replacement)

    return phone_input

#### END ####

def escape_string_built_in(phone_input):

    ### START ###

    import _mysql

    phone_param = _mysql.escape_string(phone_input)

    #### END ####

    return phone_param



# escape string example

                        ### START ###
escaped_string_result = "SELECT * FROM customers WHERE phone = '1\\' OR 1=1;--';"
                        #### END ####



# TESTS

clean_input = "8015550198"

malicious_input = "1' OR 1=1;--"

characters_to_escape = "\0\n\r'\"\\"


def print_test(condition):
    print '\tok' if condition else '\tFAIL'


print '\nbuilds dynamic queries...'

print_test(dynamic_query(clean_input) == "SELECT * FROM customers WHERE phone = '8015550198';")
print_test(dynamic_query(malicious_input) == "SELECT * FROM customers WHERE phone = '1' OR 1=1;--';")


print '\nbuilds prepared statement...'

print_test(prepared_statement(clean_input)[0] == 24)
print_test(prepared_statement(malicious_input) == None)


print '\ncalls stored procedure...'

print_test(stored_procedure(clean_input)[0] == 24)
print_test(stored_procedure(malicious_input) == None)


print '\nvalidates phones...'

print_test(is_valid_phone(clean_input))
print_test(is_valid_phone("(803) 444-3332"))
print_test(is_valid_phone("803.444.3332"))

print_test(not is_valid_phone("(803) 444-33312"))
print_test(not is_valid_phone("(803) 444-333s"))
print_test(not is_valid_phone(malicious_input))


print '\nmanually escapes strings...'

print_test(escape_string_manually("dont escape me") == "dont escape me")
print_test(escape_string_manually(characters_to_escape) == '\\0\\n\\r\\\'\\"\\\\')


print '\nbuilt in method escapes strings...'

print_test(escape_string_built_in("dont escape me") == "dont escape me")
print_test(escape_string_built_in(characters_to_escape) == '\\0\\n\\r\\\'\\"\\\\')


print '\nescape methods aren\'t in place...'

string_before = "test\0\n\r'"
print_test(escape_string_manually(string_before) != string_before)

string_before = "test\0\n\r'"
print_test(escape_string_built_in(string_before) != string_before)


print '\nexample escaped string is correct...'

print_test(dynamic_query(escape_string_manually(malicious_input)) == escaped_string_result)
print_test(dynamic_query(escape_string_built_in(malicious_input)) == escaped_string_result)


print '\ndone!\n'



def test_escape():

    import _mysql

    chars = ["\0", "'", "\"", "\b", "\n", "\r", "\t", "\\", "%", "_"];

    for char in chars:
        print "[%s] > [%s]" % (char, _mysql.escape_string(char))

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
# [\%] > [\\%]
# [\_] > [\\_]
