<?php
	/********** Streckbase2 Database *************
	File:			index.php
	Author:			Jimmy Hedström
	Version:		1.0
	Description:

	This database creates a connection with a
	mySQL server. As input this server takes a
	JSON string which contains neccessary
	information about users and their
	achievements. Depending on which type of
	request it is, the server takes care of the
	data and calls a corresponding method to
	update or look for values in the mySQL
	database. Server always responds with a
	message whether the request was successful
	or not.
	*********************************************/    

    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    header('Content-type: text/html; charset=utf8mb4');
    mysql_set_charset('utf8mb4');  

	// Input JSON string
    $array = json_decode(file_get_contents('php://input'), true);

    // Check if file contains data
    if ($array && count($array > 0)) {
    	// Include database functions
        require_once("DB_Functions.php");
        $db = new DB_Functions();

        mysql_query("SET CHARACTER SET utf8mb4");
        mysql_query("SET NAMES utf8mb4");

        date_default_timezone_set('Europe/Stockholm');
        
        // Store JSON tag
        $tag = $array["tag"];

        // Check if tag exists
        if ($tag && $tag != "") {
            // Store JSON values in variables
            $user_id            = $array["user_id"];
            $email              = $array["email"];
            $old_email          = $array["old_email"];
            $password           = $array["password"];
            $firstname          = $array["firstname"];
            $lastname           = $array["lastname"];
            $block              = $array["block"];
            $friend             = $array["friend"];
            $rate               = $array["rate"];
            $location           = $array["location"];
            $comment            = $array["comment"];
            $query              = $array["query"];
            $item_id            = $array["item_id"];
	        $name               = $array["name"];
	        $price              = $array["price"];
	        $volume             = $array["volume"];
	        $alcohol            = $array["alcohol"];
	        $debt				= $array["debt"];
	        $barcode			= $array["barcode"];
	        $count				= $array["count"];
            $id                 = $array["id"];
            $event_id			= $array["event_id"];
            $image				= $array["image"];
            $week               = $array["week"];
            $lobare				= $array["lobare"];

            // Set response JSON to default values
            $response = array("tag" => $tag, "success" => 0, "error" => 0);

            // Check the tag
            if ($tag == "login") {
                // Check for user
                $user = $db->getUserByUserID($email);

                if ($user) {
                    $hash = $user["password"];

                    if (password_verify($password, $hash)) {
                    // if ($password == $hash) {
                        $response["success"]            = 1;
                        $response["user"]["user_id"]    = $user["user_id"];
                        $response["user"]["firstname"]  = $user["firstname"];
                        $response["user"]["lastname"]   = $user["lastname"];
                        $response["user"]["debt"]       = $user["debt"];
                        $response["user"]["lobare"]     = $user["lobare"];
                        $response["user"]["block"]      = $user["block"];
                        $response["user"]["admin"]      = $user["admin"];
                    } else {
                        $response["error"]              = 1;
                        $response["error_msg"]          = "Lösenord inkorrekt";
                    }
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Kunde inte hitta \"".$email."\"";
                }
                echo json_encode($response);
            } else if ($tag == "register") {
                // Register user
                $userExists = $db->isUserExisting($email);

                if (!$userExists) {
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $bool = $db->registerUser($user_id, $email, $hash);
                    if ($bool) {
                        $response["success"]         = 1;
                    } else {
                        $response["error"]           = 1;
                        $response["error_msg"]       = "Fel, kunde inte registera användare";
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Fel, emailadressen finns redan";
                }
                echo json_encode($response);
            } else if ($tag == "isUserExisting") {
                $userExists = $db->isUserExisting($user_id);

                if ($userExists) {
                    $response["success"]            = 1;
                    $response["user"]["user_id"]    = $userExists["user_id"];
                    $response["user"]["email"]      = $userExists["email"];
                    $response["user"]["firstname"]  = $userExists["firstname"];
                    $response["user"]["lastname"]   = $userExists["lastname"];
                    $response["user"]["debt"]       = $userExists["debt"];
                    $response["user"]["lobare"]     = $userExists["lobare"];
                    $response["user"]["block"]      = $userExists["block"];
                    $response["user"]["admin"]      = $userExists["admin"];
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Användare finns inte";
                }
                echo json_encode($response);            
            } else if ($tag == "getUserByUserID") {
                $user = $db->getUserByUserID($email);

                if ($user) {
                    $response["success"]            = 1;
                    $response["user"]["user_id"]    = $user["user_id"];
                    $response["user"]["firstname"]  = $user["firstname"];
                    $response["user"]["lastname"]   = $user["lastname"];
                    $response["user"]["email"]      = $user["email"];
                    $response["user"]["debt"]       = $user["debt"];
                    $response["user"]["lobare"]     = $user["lobare"];
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Kunde inte hitta \"".$email."\"";
                }
                echo json_encode($response);
            } else if ($tag == "getAllUsers") {
                $users = $db->getAllUsers();

                if ($users) {
                    $response["success"]         = 1;
                    // Loop through all users...
                    foreach($users as $key => $value) {
                        // ...and insert to JSON response string
                        $response["user"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding users";
                }
                echo json_encode($response);
            } else if ($tag == "updatePassword") {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $updatePassword = $db->updatePassword($email, $hash);

                if ($updatePassword) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Fel, kunde inte uppdatera lösenord";
                }
                echo json_encode($response);
            } else if ($tag == "updateEmail") {
                $updateEmail = $db->updateEmail($email, $old_email);

                if ($updateEmail) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Fel, kunde inte uppdatera email";
                }
                echo json_encode($response);
            } else if ($tag == "storeCompleteUser") {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $store = $db->storeCompleteUser($user_id, $firstname, $lastname, $email, $hash);

                if ($store) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Could not register user";
                }
                echo json_encode($response);
            } else if ($tag == "storeUser") {
                $userExists = $db->isUserExisting($user_id);

                if (!$userExists) {
                    // $hash = password_hash($password, PASSWORD_DEFAULT);
                    $bool = $db->storeUser($user_id, $firstname, $lastname);
                    if ($bool) {
                        $response["success"]         = 1;
                    } else {
                        $response["error"]           = 1;
                        $response["error_msg"]       = "Error, could not register";
                    }                    
                } else {
                    $bool = $db->updateUser($user_id, $email, $firstname, $lastname, $debt, $block, $lobare);
                    if ($bool) {
                        $response["success"]         = 1;
                        $response["tag"]             = "updateUser";
                    } else {
                        $response["error"]           = 1;
                        $response["error_msg"]       = "Could not update user";
                    }
                }
                echo json_encode($response);
            } else if ($tag == "getItems") {
                $items = $db->getItems();

                if ($items) {
                    $response["success"]         = 1;
                    // Loop through all items...
                    foreach($items as $key => $value) {
                        // ...and insert to JSON response string
                        $response["items"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding items";
                }
                echo json_encode($response);
            } else if ($tag == "getAllItems") {
                $items = $db->getAllItems($user_id);

                if ($items) {
                    $response["success"]         = 1;
                    // Loop through all items...
                    foreach($items as $key => $value) {
                        // ...and insert to JSON response string
                        $response["items"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding items";
                }
                echo json_encode($response);
            } else if ($tag == "getProfile") {
                $profile = $db->getProfile($user_id);

                if ($profile) {
                    $response["success"]         = 1;
                    // Loop through all ...
                    foreach($profile as $key => $value) {
                        // ...and insert to JSON response string
                        $response["profile"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding profile";
                }
                echo json_encode($response);
            } else if ($tag == "getWeekData") {
                $week = $db->getWeekData($user_id, $week);

                if ($week) {
                    $response["success"]         = 1;
                    // Loop through all weeks...
                    foreach($week as $key => $value) {
                        // ...and insert to JSON response string
                        $response["days"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding weeks";
                }
                echo json_encode($response);
            } else if ($tag == "getLobareWeekData") {
                $week = $db->getLobareWeekData($week);
                $index = 0;

                if ($week) {
                    $response["success"]         = 1;
                    // Loop through all weeks...
                    foreach($week as $key => $value) {
                        // ...and insert to JSON response string
                        $response["result"][$key] = $value;
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding lobare week data";
                }
                echo json_encode($response);
            } else if ($tag == "getMostBuyedItem") {
                $items = $db->getMostBuyedItem($user_id);
                if ($items) {
                    $response["success"]         = 1;
                    // Loop through all friends...
                    foreach($items as $key => $value) {
                        // ...and insert to JSON response string
                        $response["items"][$key] = $value;
                    }                     
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error finding users";
                }
                echo json_encode($response);
            } else if ($tag == "updateItem") {
                $updateItem = $db->updateItem($item_id, $name, $price, $volume, $alcohol, $barcode, $image);

                if ($updateItem) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not update item";
                }
                echo json_encode($response);
            } else if ($tag == "addItem") {
                $addItem = $db->addItem($name);
                // $addPush = $db->pushNotice('1','1');

                if ($addItem) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Fel, kunde inte lägga till varan";
                }
                echo json_encode($response);
            } else if ($tag == "addCompleteItem") {
                $addCompleteItem = $db->addCompleteItem($name, $price, $volume, $alcohol, $barcode, $image);

                if ($addCompleteItem) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Fel, kunde inte lägga till varan";
                }
                echo json_encode($response);
            } else if ($tag == "purchaseItem") {
                $purchaseItem = $db->purchaseItem($user_id, $item_id, $count);
                if ($purchaseItem) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not purchase item";
                }
                echo json_encode($response);
            } else if ($tag == "getItemInfo") {
                $itemInfo = $db->getItemInfo($item_id);
                if ($itemInfo) {
                    $response["success"]            = 1;
                    $response["item"]["item_id"]    = $itemInfo["item_id"];
                    $response["item"]["type1"]      = $itemInfo["type1"];
                    $response["item"]["type2"]      = $itemInfo["type2"];
                    $response["item"]["country"]    = $itemInfo["country"];
                    $response["item"]["region"]     = $itemInfo["region"];
                    $response["item"]["info"]       = $itemInfo["info"];
                } else {
                    $response["error"]              = 1;
                    $response["error_msg"]          = "Info om vara finns inte";
                }
                echo json_encode($response);
            } else if ($tag == "purchaseBarcodeItem") {
                $code = $db->isBarcodeExisting($barcode);

                if ($code) {
                    $item_id = $code["item_id"];
                    $purchaseItem = $db->purchaseItem($user_id, $item_id, 1);
                    if ($purchaseItem) {
                        $response["success"]            = 1;
                        $response["item"]["name"]       = $code["name"];
                        $response["item"]["price"]      = $code["price"];
                        $response["item"]["volume"]     = $code["volume"];
                        $response["item"]["alcohol"]    = $code["alcohol"];
                        $response["item"]["image"]      = $code["image"];
                    } else {
                        $response["error"]           = 1;
                        $response["error_msg"]       = "Error, could not purchase item";
                    }                    
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Streckkoden finns ej i systemet!";
                }
                echo json_encode($response);    
            } else if ($tag == "delItem") {
                $delItem = $db->delItem($item_id);

                if ($delItem) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not delete item";
                }
                echo json_encode($response);  
                
            } else if ($tag == "delUser") {
                $delUser = $db->delUser($user_id);

                if ($delUser) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not delete item";
                }
                echo json_encode($response);  
            } else if ($tag == "getComments") {
                $event = $db->getComments($id);

                if ($event) {
                    $response["success"]         = 1;
                    // Loop through all...
                    foreach($event as $key => $value) {
                        // ...and insert to JSON response string
                        $response["event"][$key] = $value;
                    }
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error could not get specific event";
                }
                echo json_encode($response);
            } else if ($tag == "getMyPurchases") {
                $purchases = $db->getMyPurchases($user_id);

                if ($purchases) {
                    $response["success"]         = 1;
                    // Loop through all...
                    foreach($purchases as $key => $value) {
                        // ...and insert to JSON response string
                        $response["purchases"][$key] = $value;
                    }
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error could not get my purchases";
                }
                echo json_encode($response); 
            } else if ($tag == "getMyDebt") {
                $debt = $db->getMyDebt($user_id);

                if ($debt) {
                    $response["success"]         = 1;
                    $response["debt"]            = $debt["debt"];
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error could not get user debt";
                }
                echo json_encode($response);
            } else if ($tag == "addComment") {
                $event = $db->addComment($user_id, $event_id, $comment);
            	if ($event) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not add item";
                }
                echo json_encode($response);    
            } else if ($tag == "deletePurchase") {
                $event = $db->deletePurchase($item_id, $count, $price, $user_id);
            	if ($event) {
                    $response["success"]         = 1;
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error, could not add item";
                }
                echo json_encode($response);
            } else if ($tag == "getFeed") {
                $feed = $db->getFeed();
                if ($feed) {
                    $response["success"]         = 1;
                    // Loop through all friends...
                    foreach($feed as $key => $value) {
                        // ...and insert to JSON response string
                        $response["feed"][$key] = $value;
                    }
                } else {
                    $response["error"]           = 1;
                    $response["error_msg"]       = "Error could not get feed";
                }
                echo json_encode($response);
            } else {
            	// Error in tag
                echo "Invalid action tag!";
            }
        } else {
            echo "Access denied!";
        }
    } else {
        echo "Indata failure";
    }
?>