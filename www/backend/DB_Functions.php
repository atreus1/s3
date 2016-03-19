<?php
	/********** Streckbase2 Database *************
	File:			DB_Functions.php
	Author:			Jimmy Hedström
	Version:		1.0
	Description:

	File containing useful functions to post
	queries to MySQL database
	*********************************************/

    class DB_Functions {     
        private $db;
        private $res;
        // Constructor
        function __construct() {
        	// Require connection to database
            require_once("DB_Connect.php");
            // Connect to database
            $this->db = new DB_Connect();
            $this->db->connect();
        }
     
        // Destructor
        function __destruct() {}

        // Check if user is existing or not
        public function isUserExisting($user_id) {
            $query = "SELECT * FROM Users WHERE user_id = '$user_id'";
            $result = mysql_query($query) or die(mysql_error());
            // Check for result 
            $rows = mysql_num_rows($result);
            if ($rows > 0) {
                $result = mysql_fetch_array($result);
                return $result;
            } else {
                // user not found
                return false;
            }
        }

        public function registerUser($user_id, $email, $hash) {
            $query = "UPDATE Users SET email = '$email', password = '$hash' WHERE user_id = '$user_id'";
            $result = mysql_query($query);
            
            return true;  
        }        

        public function storeUser($user_id, $firstname, $lastname) {
            $query = "INSERT INTO Users(user_id, firstname, lastname) VALUES ('$user_id', '$firstname', '$lastname')";
            $result = mysql_query($query);
            return true;
        }

        public function storeCompleteUser($user_id, $firstname, $lastname, $email, $hash) {
            $query = "UPDATE Users SET user_id = '$user_id', firstname = '$firstname', lastname = '$lastname', email = '$email', password = '$hash' WHERE user_id = '$user_id'";
            $result = mysql_query($query);   
            return true;
        }

        public function updateUser($user_id, $email, $firstname, $lastname, $debt, $block, $lobare) {
            $query = "UPDATE Users SET email = '$email', firstname = '$firstname', lastname = '$lastname', debt = '$debt', block = '$block', lobare = '$lobare' WHERE user_id = '$user_id'";
            $result = mysql_query($query);   
            return true;
        }

        public function updatePassword($email, $password) {
            $query = "UPDATE Users SET password = '$password' WHERE email = '$email'";
            $result = mysql_query($query);
            
            return true;
        }

        public function updateEmail($email, $old_email) {
            $query = "UPDATE Users SET email = '$email' WHERE email = '$old_email'";
            $result = mysql_query($query);
            
            return true;
        }

        // Get user by email
        public function getUserByUserID($email) {
            $query = "SELECT * FROM Users WHERE email = '$email'";
            $result = mysql_query($query) or die(mysql_error());
            // Check for result 
            $rows = mysql_num_rows($result);
            if ($rows > 0) {
                $result = mysql_fetch_array($result);
                return $result;
            } else {
                // user not found
                return false;
            }
        }

        public function setUsername($user_id, $name) {
            $query = "UPDATE Users SET name = '$name' WHERE user_id = '$user_id'";
            $result = mysql_query($query) or die(mysql_error());

            return true;   
        }

        public function updateItem($item_id, $name, $price, $volume, $alcohol, $barcode, $image) {
                $url = explode('/', $image);
                        $last = array_pop($url);
                $imageLocal = 'imgs/'.$last;

            if (!file_exists($imageLocal)) {
                file_put_contents($imageLocal, file_get_contents($image));
            }            

            $host = "http://tolva.nu/streckbase2_server/".$imageLocal;

            if (!$image) {
                $host = "";
            }

            $query = "UPDATE Items SET name = '$name', price = '$price', volume = '$volume', alcohol = '$alcohol', image = '$host' WHERE item_id = '$item_id'";
            $result = mysql_query($query) or die(mysql_error());
            $query = "INSERT INTO Barcodes(item_id, code) VALUES ('$item_id', '$barcode')";
            $result = mysql_query($query) or die(mysql_error());
            return true;   
        }

        public function addCompleteItem($name, $price, $volume, $alcohol, $barcode, $image) {
            $this->addItem($name);
            $item_id = $this->getItem($name);
            $this->updateItem($item_id, $name, $price, $volume, $alcohol, $barcode, $image);
            return true;   
        }   
        
        public function getItems() {
            $query = "SELECT Items.item_id, name, price, volume, alcohol, image, group_concat(code) as code FROM Items LEFT JOIN Barcodes ON Barcodes.item_id=Items.item_id group by Items.item_id order by Items.item_id";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every user to array
                array_push($array, $temp);
            }
            return ($array);            
        }

        public function getAllItems($user_id) {
            $query =    "SELECT i.item_id as id, 0 as amount, i.name as name, i.price as price, i.volume as volume, i.alcohol as alcohol, i.image as image, (SELECT count(1) FROM ItemsInfo t WHERE t.item_id = i.item_id) AS info FROM Items i
                        UNION
                        SELECT i.item_id as id, COUNT(i.item_id) as amount, i.name AS name, i.price as price, i.volume as volume, i.alcohol as alcohol, i.image as image, (SELECT count(1) FROM ItemsInfo t WHERE t.item_id = i.item_id) AS info FROM Purchases p INNER JOIN Items i ON i.item_id = p.item_id WHERE user_id = '$user_id'
                        GROUP BY i.name
                        ORDER BY amount ASC";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every user to array
                array_push($array, $temp);
            }
            return ($array);            
        }
        
        public function getMostBuyedItem($user_id) {
            $query = "SELECT p.item_id, i.name, i.image, i.price, count(*) as heavydrinker FROM Purchases p INNER JOIN Items i ON p.item_id=i.item_id where user_id='$user_id' group by p.item_id";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every user to array
                array_push($array, $temp);
            }
            return ($array);            
        }

        public function isBarcodeExisting($barcode) {
            $query = "SELECT b.item_id, i.name, i.price, i.volume, i.alcohol, i.image FROM Barcodes b INNER JOIN Items i On b.item_id=i.item_id WHERE b.code = '$barcode'";
            $result = mysql_query($query) or die(mysql_error());
            // Check for result 
            $rows = mysql_num_rows($result);
            if ($rows > 0) {
                $result = mysql_fetch_array($result);
                return $result;
            } else {
                // user not found
                return false;
            }
        }

        public function getItemInfo($item_id) {
            $query = "SELECT * FROM ItemsInfo WHERE item_id = '$item_id'";
            $result = mysql_query($query) or die(mysql_error());
            // Check for result 
            $rows = mysql_num_rows($result);
            if ($rows > 0) {
                $result = mysql_fetch_array($result);
                return $result;
            } else {
                // item not found
                return false;
            }
        }
        
        public function purchaseItem($user_id, $item_id, $count) {
                $now = date("Y-m-j H:i:s");
                $query = "SELECT price FROM Items where item_id = '$item_id'";
                $price = mysql_result(mysql_query($query),0);
                for (; $count >= 1; $count--) {
                $query = "INSERT INTO Purchases(user_id,item_id,date) VALUES ('$user_id','$item_id', '$now')";
                $result = mysql_query($query);
                $query = "UPDATE Users SET debt = debt + '$price' where user_id = '$user_id'";
                $result = mysql_query($query);
                }
            return true;
        }

        public function getMyPurchases($user_id) {
            $query = "SELECT p.id, p.item_id, i.name, i.price, i.volume, i.alcohol, i.image, p.date as date, count(p.date) as multi FROM Purchases p inner JOIN Items i ON i.item_id=p.item_id WHERE p.user_id = '$user_id' group by p.date order by date desc LIMIT 50";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every event to array
                array_push($array, $temp);
            }
            return ($array);
        }

        public function getMyDebt($user_id) {
            $query = "SELECT debt FROM Users WHERE user_id = '$user_id'";
            $result = mysql_query($query) or die(mysql_error());
            $result = mysql_fetch_array($result);
            return ($result);
        }

        public function deletePurchase($item_id, $count, $price, $user_id) {
                $tmp = $item_id+$count-1;
            $query = "DELETE from Purchases WHERE id BETWEEN '$item_id' AND '$tmp'";
            $result = mysql_query($query);   
            $tmp = $count*$price;
            $query = "UPDATE Users SET debt = debt - '$tmp' where user_id = '$user_id'";
            $result = mysql_query($query);
            return true;
        }
        
        public function addItem($name) {
            $query = "INSERT INTO Items(name) VALUES ('$name')";
            $result = mysql_query($query);
           
            return true;
        }

        public function getItem($name) {
            $query = "SELECT item_id FROM Items WHERE name = '$name'";
            $result = mysql_query($query);
            $result = mysql_fetch_array($result);
            return ($result["item_id"]);
        }
        
        public function delItem($item_id) {
            $query = "DELETE FROM Items WHERE item_id = '$item_id'";
            $result = mysql_query($query);   
            return true;
        }

        public function delUser($user_id) {
            $query = "DELETE FROM Users WHERE user_id = '$user_id'";
            $result = mysql_query($query);   
            return true;
        }

        public function getFeed() {
            $query = "SELECT p.id, p.user_id, p.item_id, i.image, p.date, count(p.date) as multi, u.firstname, u.lastname, i.name, count(c.comment) as comments FROM Purchases p inner JOIN Users u ON u.user_id=p.user_id inner JOIN Items i ON i.item_id=p.item_id LEFT JOIN Comments c ON c.event_id=p.id group by p.date order by p.id desc LIMIT 50";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every event to array
                array_push($array, $temp);
            }
            return ($array);
        }

        public function getFeedWithID($id) {
            $query = "SELECT p.id, p.user_id, p.item_id, i.image, unix_timestamp(p.date) as date, count(p.date) as multi, u.firstname, u.lastname, i.name FROM Purchases p inner JOIN Users u ON u.user_id=p.user_id inner JOIN Items i ON i.item_id=p.item_id WHERE p.id = '$id' group by p.date";
            // HOW TO GET MULTI?
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every event to array
                array_push($array, $temp);
            }
            return ($array);          
        }
        
        public function addComment($user_id, $event_id, $comment) {
            $now = date("Y-m-j H:i:s");
            $query = "INSERT INTO Comments(user_id, event_id, comment, date) VALUES ('$user_id', '$event_id', '$comment', '$now')";
            $result = mysql_query($query);   
            return true;
        }
        
        public function getComments($id) {
            $query = "SELECT c.comment, c.date, u.firstname, u.lastname FROM Comments c INNER JOIN Users u ON c.user_id=u.user_id where event_id='$id' order by c.date asc";
            $result = mysql_query($query) or die(mysql_error());
            $array = array();

            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every event to array
                array_push($array, $temp);
            }
            return ($array);          
        }

        public function getProfile($user_id) {
        	if ($user_id) {
            	$query = "SELECT u.firstname, u.lastname, u.debt, i.name, count(p.item_id) as sum, MAX(p.date) as date FROM Users u INNER JOIN Purchases p on u.user_id=p.user_id INNER JOIN Items i on p.item_id=i.item_id where u.user_id = '$user_id' group by p.item_id order by max(p.date) desc";
            } else {
            	$query = "SELECT u.firstname, u.lastname, u.debt, i.name, count(p.item_id) as sum, p.date FROM Users u INNER JOIN Purchases p on u.user_id=p.user_id INNER JOIN Items i on p.item_id=i.item_id group by p.item_id";
            }

            $result = mysql_query($query) or die(mysql_error());
            $array = array();
            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                // Add every event to array
                array_push($array, $temp);
            }
            return ($array);
        }

        public function getWeekData($user_id, $week) {
            $query =    "SELECT COUNT(p.item_id) AS amount, WEEKDAY(p.date) AS day, WEEK(p.date, 7) as week, SUM(i.price) as debt
                        FROM Purchases p inner JOIN `Items` i ON i.item_id = p.item_id
                        WHERE p.user_id = '$user_id' AND WEEK(p.date, 7) = '$week'
                        GROUP BY day, week
                        ORDER BY day";

            $result = mysql_query($query) or die(mysql_error());
            $array = array();
            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                array_push($array, $temp);
            }
            return ($array);
        }

        public function getLobareWeekData($week) {
            $query =    "SELECT WEEKDAY(p.date) AS day, WEEK(p.date, 7) as week, SUM(i.price) as debt, u.firstname, u.lastname
                        FROM (Purchases p inner JOIN Items i ON i.item_id = p.item_id) INNER JOIN Users u ON u.user_id = p.user_id
                        WHERE u.lobare = 1 AND WEEK(p.date, 7) = '$week'
                        GROUP BY day,debt
                        ORDER BY day";

            $result = mysql_query($query) or die(mysql_error());
            $array = array();
            while ($temp = mysql_fetch_array($result, MYSQL_ASSOC)) {
                array_push($array, $temp);
            }
            return ($array);
        }
    }
?>