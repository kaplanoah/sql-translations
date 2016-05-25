
// dynamic query

function dynamicQuery(phoneInput) {

    /// START ///

    var sqlText = "SELECT * FROM customers WHERE phone = '" + phoneInput + "';"

    //// END ////

    return sqlText;
}



// prepared statement

function preparedStatement(phoneInput, callback) {

    /// START ///

    // mysql client for node.js (node-mysql2)
    var mysql = require('mysql2');

    // connect to the database
    var connection = mysql.createConnection({user: 'root@localhost', database: 'bakery'});

    var statement = 'SELECT * FROM customers WHERE phone = ?';

    // execute the statement with an array holding a value for each parameter
    connection.execute(statement, [phoneInput], function(err, rows) {

        // DELETE
        callback(rows[0]);
        connection.end();
    });

    //// END ////
}



// stored procedure

function storedProcedure(phoneInput) {

    /// START ///

    // mysql client for node.js (node-mysql2)
    var mysql = require('mysql');

    // connect to the database
    var connection = mysql.createConnection({
        user: 'root@localhost',
        database: 'bakery',
        multipleStatements: true,
    });

    // execute the procedure
    connection.query("SET @phone_input = '" + phoneInput +  "'; CALL get_customer_from_phone(@phone_input);");

    //// END ////

    connection.end();
}



// phone validation

/// START ///

function isValidPhone(phoneInput) {

    // contains only valid phone characters
    if (phoneInput.match(/[^0-9()-. ]/)) {
        return false;
    }

    // has exactly 10 digits
    if (phoneInput.replace(/[^0-9]/g, '').length !== 10) {
        return false;
    }

    return true;
}

//// END ////



// escape string method

/// START ///

function escapeStringManually(phoneInput) {

    // escape backslashes first so we don't escape the
    // backslashes we'll add to escape other special characters
    phoneInput = phoneInput.replace('\\', '\\\\');

    var charToReplacement = {
        '\0' : '\\0',
        '\n' : '\\n',
        '\r' : '\\r',
        '\'' : '\\\'',
        '\"' : '\\\"',
    }

    for (var charToReplace in charToReplacement) {
        var replacement = charToReplacement[charToReplace];

        if (phoneInput.indexOf(charToReplace) < 0) continue;
        phoneInput = phoneInput.replace(charToReplace, replacement);
    }

    return phoneInput;
}

//// END ////

function escapeStringBuiltIn(phoneInput) {

    /// START ///

    // mysql client for node.js (node-mysql)
    var mysql = require('mysql');

    var phoneParam = mysql.escape(phoneInput);

    //// END ////

    return phoneParam;
}



// escape string example

                          /// START ///
var escapedStringResult = "SELECT * FROM customers WHERE phone = '1\\' OR 1=1;--';";
                          //// END ////



// TESTS

var cleanInput = '8015550198';

var maliciousInput = "1' OR 1=1;--";

var charactersToEscape = '\0\n\r\'"\\';


function printTest(condition) {
    console.log(condition ? '\tok' : '\tFAIL');
}


console.log('\nbuilds dynamic queries...');

printTest(dynamicQuery(cleanInput) === "SELECT * FROM customers WHERE phone = '8015550198';");
printTest(dynamicQuery(maliciousInput) === "SELECT * FROM customers WHERE phone = '1' OR 1=1;--';");


// prepared statement

function cleanTest(callback) {
    preparedStatement(cleanInput, function(result) {
        callback(result.customer_id, testPreparedStatement);
    });
}

function maliciousTest(cleanOutput, callback) {
    preparedStatement(maliciousInput, function(result) {
        callback(cleanOutput, result);
    });
}

function testPreparedStatement(cleanOutput, malicousOutput) {

    console.log('\nbuilds prepared statement...');

    printTest(cleanOutput === 24);
    printTest(malicousOutput === undefined);

    done();
}

cleanTest(maliciousTest);


console.log('\ncalls stored procedure...');

console.log(storedProcedure(cleanInput));


console.log('\nvalidates phones...');

printTest(isValidPhone(cleanInput));
printTest(isValidPhone('(803) 444-3332'));
printTest(isValidPhone('803.444.3332'));

printTest(!isValidPhone('(803) 444-33312'));
printTest(!isValidPhone('(803) 444-333s'));
printTest(!isValidPhone(maliciousInput));


console.log('\nmanually escapes strings...');

printTest(escapeStringManually('dont escape me') === 'dont escape me');
printTest(escapeStringManually(charactersToEscape) === '\\0\\n\\r\\\'\\"\\\\');


console.log('\nbuilt in method escapes strings...');

printTest(escapeStringBuiltIn("dont escape me") === "'dont escape me'");
printTest(escapeStringBuiltIn(charactersToEscape) === "'\\0\\n\\r\\\'\\\"\\\\'");


console.log('\nescape methods aren\'t in place...');

stringBefore = "test\0\n\r'";
printTest(escapeStringManually(stringBefore) !== stringBefore);

stringBefore = "test\0\n\r'";
printTest(escapeStringBuiltIn(stringBefore) !== stringBefore);


console.log('\nexample escaped string is correct...');

printTest(dynamicQuery(escapeStringManually(maliciousInput)) === escapedStringResult);

// built in method adds single quotes around strings
var escapedString = escapeStringBuiltIn(maliciousInput);
var queryWithTrimmedString = dynamicQuery(escapedString.slice(1, escapedString.length - 1));
printTest(queryWithTrimmedString === escapedStringResult);


function done() {
    console.log('\ndone!\n');
}



function testEscape() {

    var mysql = require('mysql');

    var chars = ["\0", "'", "\"", "\b", "\n", "\r", "\t", "\\", "%", "_"];

    chars.forEach(function(char) {
        console.log('[' + char + '] > [' + mysql.escape(char) + ']');
    });
}

// testEscape()

// [] > ['\0']
// ['] > ['\'']
// ["] > ['\"']
// ] > ['\b']
// [
// ] > ['\n']
// ] > ['\r']
// [   ] > ['\t']
// [\] > ['\\']
// [%] > ['%']
// [_] > ['_']
