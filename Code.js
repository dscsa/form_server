

//Key function that serves up our webpage
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('form.html');        
}




function logIn(email){
  //Takes the email, if it matches, returns relavant info, otherwise returns null
  var sh = SpreadsheetApp.openById(serverID())
  
  email = email.toLowerCase()
  var data = sh.getSheetByName("User DB").getDataRange().getValues()
  for(var i = 1; i < data.length; i++){
    var row_email = data[i][0].toString().toLowerCase()
    if((row_email.length > 0) && (row_email == email.trim())){
      sh.getSheetByName("Form Entries").appendRow(["",row_email,"","","","", data[i][3]]) //make note of email, folderID
      return [data[i][1],data[i][2], data[i][4]]
    }
  }
  
  sh.getSheetByName("Form Entries").appendRow(["FACILITY NOT FOUND",email])
  return []
}





//Temporary pulling option that divides up by west/east coast
function getSuppliesOptions(state){
  var data = SpreadsheetApp.openById(serverID()).getSheetByName("Supplies Options").getDataRange().getValues()
  
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
function saveFormData(arr){
  var sheet = SpreadsheetApp.openById(serverID()).getSheetByName("Form Entries")
  var data = sheet.getDataRange().getValues()
  var last_row = sheet.getLastRow()
  
  arr.push('')
  arr.push(Utilities.formatDate(new Date(), "GMT-04:00", "MM/dd/yyyy HH:mm:ss"))

  if(data[last_row-1][1].toString().toLowerCase() != arr[0].toLowerCase()){ //then add a whole new row
    arr.unshift("ROWS NOT LINES UP")
    sheet.appendRow(arr)
  } else {
    sheet.getRange("C" + last_row + ":G" + last_row).setValues([arr.slice(1)])
  }
  
  SpreadsheetApp.flush()
}







//Function that uploads folder
function uploadFiles(form) { 
  try {
    
    var folder = null;
    var entries = SpreadsheetApp.openById(serverID()).getSheetByName("Form Entries")
    var last_row = entries.getLastRow()
    var folder_id = entries.getRange("H" + last_row).getValue().toString()
    
    if(folder_id.length > 0){
      folder = DriveApp.getFolderById(folder_id)
    } else {
      folder = DriveApp.getFolderById(dropFolderID()); //defaults to the parent folder - for not founds, or facilities that dont have a folder id matched
    }

    
    var blob = form.myFile;   
    var filename = ""

    if(blob.getName().trim().length > 0){
      filename = form.pharmacy_name + " ; " + blob.getName().trim()
      
      var file = folder.createFile(blob);    
      file.setDescription("Uploaded by " + form.contact_name);
      file.setName(filename)
    }
    
    entries.getRange("F" + last_row).setValue(filename) //note the filename for bertha integraiton part

    return "Thank you! We'll schedule a FedEx Ground pickup for the next business day."
    
  } catch (error) {
    
    return "We encountered an error while uploading your record. Please contact a SIRUM team member at info@sirum.org    Error: " + error.toString();
    
  }
}



//----------------------------------------------------------------------------------------------------------------


//DEPRACATED
//Functions that pull from the spreadsheet, if adding extra fields, model after these
function getSuppliesList(){
  var data = SpreadsheetApp.openById(serverID()).getSheetByName("Options").getDataRange().getValues()
  var res = []
  for(var i = 1 ; i < data.length; i++){
    if(data[i][0].toString().length > 0){
      res.push(data[i][0].toString())
    }
  }
  return res
} 



//DEPRACATED
//builds an object mapping users to their pharmacy and whether that pharmacy requires aform. User-by-user can specifiy if they need a form
function getUserMap(){
  var data = SpreadsheetApp.openById(serverID()).getSheetByName("User DB").getDataRange().getValues()
  var res = {}
  for(var i = 1; i < data.length; i++){
    if(data[i][0].toString().length > 0) res[data[i][0]] = [data[i][1],data[i][2],data[i][3], data[i][4]]
  }
  return res
}


//Potentially DEPRECATED
//Gets a 2D array of criteria, box count options, box size options, label count options
function getOptions(){
  var data = SpreadsheetApp.openById(serverID()).getSheetByName("Options").getDataRange().getValues()
  
  var res = []
  var size_res = []
  var count_res = []
  var label_res = []
  var criteria = [data[1][0]]
  Logger.log(data.length)
  for(var i = 1 ; i < data.length; i++){
    if(data[i][1].toString().length > 0){
      count_res.push(data[i][1].toString())
    }
    
    if(data[i][2].toString().length > 0){
      size_res.push(data[i][2].toString())

    }
    if(data[i][3].toString().length > 0){
      label_res.push(data[i][3].toString())
    }  
  }
  
  res.push(criteria)
  res.push(count_res)
  res.push(size_res)
  res.push(label_res)
  
  return res
}



//Depracated client-side functions


 //async ways of building all the variables from the gsheet options
          /*$(function() {
            google.script.run.withSuccessHandler(buildOptions).getSuppliesOptions()
          });*/

          //Insert the supplies options
          //given an array of three arrays: box count, box size, and label count options
          /*function buildOptions(supplies) {
            var box_count_options = $('#box_count_options');
            var box_size_options = $('#box_size_options');
            var label_options = $('#label_options');
            
            var criteria = supplies[0][0]
            //document.getElementById("criteria-text").innerHTML = criteria
            
            for (var i = 0; i < supplies[1].length; i++) { //build boxes count dropdown
              box_count_options.append('<option value="' + supplies[1][i] + '">' + supplies[1][i] + '</option>');
            }
            
            for (var i = 0; i < supplies[2].length; i++) { //build boxes size dropdown
              box_size_options.append('<option value="' + supplies[2][i] + '">' + supplies[2][i] + '</option>');
            }

            for(var i = 0; i < supplies[3].length; i++){
              label_options.append('<option value="' + supplies[3][i] + '">' + supplies[3][i] + '</option>');
            }
            
          }*/

          //Insert the full list of Pharmacies (not currently in use)
          /*function listPharmacies(names) {
            var list = $('#full_pharmacy_list');
            for (var i = 0; i < names.length; i++) {
              var string_html = '<label><input type="checkbox" class="pharmacy-checkbox-input" id="' + names[i] + '" onclick="uncheckOthers(' +"'" + names[i] + "'" + ')"/> ' + names[i] + '</label><br>'
              list.append(string_html);
            }
          }
          
          
          //A helper function to make sure you can only select one of the pharmacy-checkbox-input checkboxes
          function uncheckOthers(id){
            console.log(id)
            var all_facilities = document.getElementsByClassName("pharmacy-checkbox-input") //if using for other class of checkbox, then switch out class
            
            for(var i = 0; i < all_facilities.length; i++){
              if(all_facilities[i].id != id){
                document.getElementById(all_facilities[i].id).checked = false
              }
            }
            
          }
          
                      
            <input class = "button" type="submit" value="Upload" 
                     onclick="this.value='Uploading..';
                              google.script.run.withSuccessHandler(fileUploaded)
                              .uploadFiles(this.parentNode);
                              return false;">
            <div id="output"></div>
          
          
          */