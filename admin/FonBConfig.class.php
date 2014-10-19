<?php

/**
 * 
 */
class FonBFileException extends Exception {};
/**
 * 
 */
class FonBConfig{
	private $phoneb_ini_path;
	private $users_ini_path;
	private $last_error;
	/**
	 * starts settings by loading ini files.
	 * @param string $phoneb_ini_path phoneb.cfg path
	 * @param string $users_ini_path  users.cfg path
	 */
	public function __construct($phoneb_ini_path,$users_ini_path){
		$this->phoneb_ini_path = $phoneb_ini_path;
		$this->users_ini_path = $users_ini_path;
	}
	/**
	 * get a list of users in users.cfg
	 * @return dictionary key=extension, value= array of details
	 */
	public function get_users(){
		if(file_exists($this->users_ini_path)){
			return @parse_ini_file($this->users_ini_path, true);
		}
		else{
			throw new FonBFileException(sprintf("File %s missing or permission denied. 
		Please make sure you have installed FonB and given read permissions to %s folder and %s file.", $this->users_ini_path, dirname($this->users_ini_path), $this->users_ini_path));
		}
	}

	public function getDepartments()
	{
		// Get all the Users
		$users = $this->get_users();
		
		$departments = array();
		foreach($users as $extension) {
			if ( !empty($extension["Department"]) && !in_array(trim($extension["Department"]),$departments) )
				$departments[] = trim($extension["Department"]);
		}
		return $departments;
	}

	public function getTotalUsersAllowed() {
		$phoneb = $this->get_phoneb();
		if(isset($phoneb['PhoneB']) && intval($phoneb['PhoneB']['ListenPort'])){
			$ListenPort = $phoneb['PhoneB']['ListenPort'];
			$ListenPortString = ":$ListenPort";
		}

		$PhonebLicURL = "http://localhost$ListenPortString/get?json=Lic";
		try {
			$JSON = @file_get_contents($PhonebLicURL);
		} catch(Exception $e){
			return;
		}

		return json_decode($JSON,true);
	}
	/**
	 * [get_phoneb description]
	 * @return [type] [description]
	 */
	public function get_phoneb(){
		if(file_exists($this->phoneb_ini_path)){
			return @parse_ini_file($this->phoneb_ini_path, true);
		}
		else{
			throw new FonBFileException(sprintf("File %s missing or permission denied. 
		Please make sure you have installed FonB and given read permissions to %s folder and %s file.", $this->phoneb_ini_path, dirname($this->phoneb_ini_path), $this->phoneb_ini_path));
		}
	}

	public function isDemo(){
		// XXX TODO Rewrite the logic
	}

	public function restart(){
		$output = array();
		$phoneb = $this->get_phoneb();
		if(isset($phoneb['PhoneB']) && intval($phoneb['PhoneB']['ListenPort'])){
			$ListenPort = $phoneb['PhoneB']['ListenPort'];
			$ListenPortString = ":$ListenPort";
		}

		$PhonebLicURL = "http://localhost$ListenPortString/reload";
		try {
			$JSON = @file_get_contents($PhonebLicURL);
		} catch(Exception $e){
			return;
		}
		return "asterisk@elastix:/$ service phoneb restart<br/>" . implode("<br/>", $output);
	}

	/**
	 * [write_users description]
	 * @param  array  $data [description]
	 * @return [type]       [description]
	 */
	public function write_users($data){
		copy($this->users_ini_path, $this->users_ini_path.".backup");
		if(file_exists($this->users_ini_path.".backup")){
			$this->write_php_ini($data, $this->users_ini_path);
			$message = $this->users_ini_path . " written. Restart phoneb to see changes.";
			$this->restart();
		}
		else{
			$message = "Permission denied while writing " . dirname($this->users_ini_path);
			header("Location: " . $_SERVER["REQUEST_URI"] . "&message=" . urlencode($message));
			exit;
		}
	}
	/**
	 * [write_phoneb description]
	 * @param  array  $data [description]
	 * @return [type]       [description]
	 */
	public function write_phoneb($data){
		copy($this->phoneb_ini_path, $this->phoneb_ini_path.".backup");
		if(file_exists($this->phoneb_ini_path.".backup")){
			$this->write_php_ini($data, $this->phoneb_ini_path);
			$message = $this->phoneb_ini_path . " written. Restart phoneb to see changes.";
			$this->restart();
		}
		else{
			$message = "Permission denied while writing " . dirname($this->phoneb_ini_path);
			header("Location: " . $_SERVER["REQUEST_URI"] . "&message=" . urlencode($message));
			exit;
		}
	}
	/**
	 * [write_php_ini description]
	 * @param  [type] $array [description]
	 * @param  [type] $file  [description]
	 * @return [type]        [description]
	 */
	private function write_php_ini($array, $file){
	    $res = array();
	    foreach($array as $key => $val)
	    {
	        if(is_array($val))
	        {
	            $res[] = "[$key]";
	            foreach($val as $skey => $sval) $res[] = "$skey = ".(is_numeric($sval) ? $sval : '"'.$sval.'"');
	        }
	        else $res[] = "$key = ".(is_numeric($val) ? $val : '"'.$val.'"');
	    }
	    $this->safefilerewrite($file, implode("\r\n", $res) ."\r\n");
	}
	/**
	 * [safefilerewrite description]
	 * @param  [type] $fileName   [description]
	 * @param  [type] $dataToSave [description]
	 * @return [type]             [description]
	 */
	private function safefilerewrite($fileName, $dataToSave){
		if ($fp = fopen($fileName, 'w'))
	    {
	        $startTime = microtime();
	        do
	        {            $canWrite = flock($fp, LOCK_EX);
	           // If lock not obtained sleep for 0 - 100 milliseconds, to avoid collision and CPU load
	           if(!$canWrite) usleep(round(rand(0, 100)*1000));
	        } while ((!$canWrite)and((microtime()-$startTime) < 1000));

	        //file was locked so now we can store information
	        if ($canWrite)
	        {            fwrite($fp, $dataToSave);
	            flock($fp, LOCK_UN);
	        }
	        fclose($fp);
	    }

	}
}




?>
