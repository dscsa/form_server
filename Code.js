//Key function that serves up our webpage
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('form.html');        
}



//Handles logging in
//If supplies only, flags appropriately for down-the-line workflow
//adds row here to start with so that we know if somebody logged in and didn't complete, 
//in case of issue
function logIn(email, supplies_only){
  
  //Takes the email, if it matches, returns relavant info, otherwise returns null
  var sh = SpreadsheetApp.openById(SERVER_ID)
  
  var flag = supplies_only ? "SUPPLY REQUEST - " : ""
  email = email.toLowerCase()
  var data = sh.getSheetByName("User DB").getDataRange().getValues()
  
  for(var i = 1; i < data.length; i++){
    var row_email = data[i][0].toString().toLowerCase()
    
    if((row_email.length > 0) && (row_email == email.trim())){
      sh.getSheetByName("Form Entries").appendRow([flag,row_email,"","","","", data[i][3]]) //make note of email, folderID
      return [data[i][1],data[i][2], data[i][4]]
    }
  
  }
  
  sh.getSheetByName("Form Entries").appendRow([flag + "FACILITY NOT FOUND",email])
  return []
}





//Temporary pulling option that divides up by west/east coast
function getSuppliesOptions(state){
  var data = SpreadsheetApp.openById(SERVER_ID).getSheetByName("Supplies Options").getDataRange().getValues()
  
  var res = [] //will be an array of two arrays: west coast and east coast option
  
  var west_coast_options = []
  var east_coast_options = []
  
  //all east cost options
  var box_count = []
  var box_size = []
  var east_labels = []
  
  //all west coast options
  var west_boxes = []
  var west_labels = []
  
  var west_coast_states = []
  var east_coast_states = []
  
  for(var i = 1; i < data.length; i++){
    if(data[i][0].toString().length > 0) box_count.push(data[i][0].toString().trim());
    if(data[i][1].toString().length > 0) box_size.push(data[i][1].toString().trim());
    if(data[i][2].toString().length > 0) east_labels.push(data[i][2].toString().trim());
    if(data[i][3].toString().length > 0) west_boxes.push(data[i][3].toString().trim());
    if(data[i][4].toString().length > 0) west_labels.push(data[i][4].toString().trim());
    if(data[i][5].toString().length > 0) east_coast_states.push(data[i][5].toString().trim());
    if(data[i][6].toString().length > 0) west_coast_states.push(data[i][6].toString().trim());
  }
  
  if(east_coast_states.indexOf(state) > -1){
    res.push(box_count)
    res.push(box_size)
    res.push(east_labels)
  } else {
    res.push(west_boxes)
    res.push(west_labels)
  }

  return res
}






//Takes data from form, if all fields correctly filled and saved to spreadsheet (like DB)
function saveFormData(just_supplies,arr){
  var sheet = SpreadsheetApp.openById(SERVER_ID).getSheetByName("Form Entries")
  
  var row = findRow(sheet,just_supplies,arr[0])
  
  arr.push('')
  arr.push(Utilities.formatDate(new Date(), "GMT-04:00", "MM/dd/yyyy HH:mm:ss"))

  if(row > -1){
    sheet.getRange("C" + (row+1) + ":G" + (row+1)).setValues([arr.slice(1)])
  } else {
    //if here, there was an issue with lining up rows
    var error_txt = just_supplies ? 'SUPPLY REQUEST - ': 
    arr.unshift(error_txt + "ROWS NOT LINES UP")
    sheet.appendRow(arr)
  }
  
  SpreadsheetApp.flush()
  
}





//Used in saveData and uploadFile to tag the appropriate rows
function findRow(sheet,just_supplies,email){
  var data = sheet.getDataRange().getValues()
  var row = -1

  for(var i = data.length-1; i > data.length - 10; i--){ //check 10 last rows, this helps with concurrency issue, but no reason there should be that much of it

    if(just_supplies == (data[i][0].toString().indexOf('SUPPLY') > -1)){
        if((data[i][1].toString().trim().toLowerCase() == email.trim().toLowerCase())){
          return i
        }
    }
    
  }
  return row
  
}




//Function that uploads folder
function uploadFiles(form) { 
  try {
    
    var folder = null;
    var entries = SpreadsheetApp.openById(SERVER_ID).getSheetByName("Form Entries")
    var row = findRow(entries,false,form.user_email)
    
    var folder_id = entries.getRange("H" + (row+1)).getValue().toString()
    
    if(folder_id.length > 0){
      folder = DriveApp.getFolderById(folder_id)
    } else {
      folder = DriveApp.getFolderById(DROP_FOLDER_ID); //defaults to the parent folder - for not founds, or facilities that dont have a folder id matched
    }

    
    var blob = form.myFile;   
    var filename = ""

    if(blob.getName().trim().length > 0){
      filename = form.pharmacy_name + " ; " + blob.getName().trim()
      
      var file = folder.createFile(blob);    
      file.setDescription("Uploaded by " + form.contact_name);
      file.setName(filename)
    }
    
    entries.getRange("F" + (row+1)).setValue(filename) //note the filename for bertha integraiton part

    return "Thank you! We'll schedule a FedEx Ground pickup for the next business day."
    
  } catch (error) {
    
    return "We encountered an error while uploading your record. Please contact a SIRUM team member at info@sirum.org    Error: " + error.toString();
    
  }
}