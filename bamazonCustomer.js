var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'bamazon'
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\nPRODUCTS AVAILABLE FOR PURCHASE:");
    for (var i = 0; i < res.length; i++) {
    	console.log(
    		"\nItem ID:", res[i].item_id,
    		"\nProduct:", res[i].product_name,
    		"\nPrice: $" + res[i].price, "\n",
    		"\n------------------------------------------"
    	);    	
    };
  console.log("\n");
  // run the start function after the connection is made to prompt the user
  start();

  });
});

function start() {
  inquirer.prompt([
    {
      name: "start",
      type: "confirm",
      message: "Would you like to purchase an item? "   
    },
  ]).then(function(user) {
    if (user.start === true) {
      buy()
    } else {
      console.log("OK then! \nYou're missin' out on some major deals! \nHope to see you again!");
      connection.end();
    }
  })
};

function buy() {
	inquirer.prompt([
	  {
		  name: "purchaseID",
		  type: "input",
		  message: "Please enter the item ID that you'd like to purchase: "
	  },
	  {
	  	name: "count",
	  	type: "input",
	  	message: "How many would you like?"
	  }
	])
	.then(function(userInput) {
    connection.query("SELECT * FROM products WHERE item_id = ?",
      [userInput.purchaseID],
      function(err, res) {
        console.log("\nCurrently in Stock: " + res[0].stock_quantity);
        if (err) throw err;
        if (Number(userInput.count) <= res[0].stock_quantity) {
          var updateQuantity = res[0].stock_quantity - Number(userInput.count);
          connection.query("UPDATE products SET ? WHERE ?", 
            [
              {
                stock_quantity: updateQuantity
              },
              {
                item_id: res[0].item_id
              }
            ]
          );
          if (Number(userInput.count) === 0) {
            console.log("Change your mind?\n");
            start()
          } else {
          console.log("Item purchased!\n");
          connection.end();
          }
        } else {
          console.log("Sorry! Not enough in stock!\n");
          buy()
        }  
      }
    )
    })
}