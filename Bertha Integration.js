
//Run every minute to send an email to Bertha system, which'll process it to log new row
function updateBertha(){
  var recipient = BERTHA_EMAIL
  var debug_email = DEBUG_EMAIL
  var subject = "Auto-Log API: Log Donation"
  var message = ""
  var email_num_limit = 20; //because there should be no instance of more than 20 emails at once (catches a weird bug still tbd from 9/28 where it created a new column)  
  var num_emails = 0;
  
  var sheet = SpreadsheetApp.openById(SERVER_ID).getSheetByName('Form Entries')
  var data = sheet.getDataRange().getValues()

  var indexFlag = 0
  var indexEmail = 1
  var indexName = 2
  var indexFacility = 3
  var indexSupplies = 4
  var indexFilename = 5
  var indexFolderId = 7
  var indexBerthaSent = 8
  
  var timestamp = Utilities.formatDate(new Date(), "GMT-04:00", "MM/dd/yyyy HH:mm:ss")
  
  //TODO: edit the way it reads flag and handles rows that are just supply requests
  
  for(var i = 0; i < data.length; i++){
    if(data[i][indexBerthaSent].toString().trim().length == 0){ //only look at new rows 
        if(data[i][indexName].toString().trim().length > 0){ //only look at submitted rows

          var flag = data[i][indexFlag].toString().trim()
          
          var num_boxes = (~ flag.indexOf('SUPPLY')) ? '0' : '1'
          
          
          if(~ data[i][indexFlag].toString().indexOf("FACILITY NOT FOUND")){
            
            message = "Facility: PHARMACY FORM ENTERED: " + cleanFacility(data[i][indexFacility]) + "\nNumber Of Boxes: " + num_boxes + "\n"
            message += "Contact: " + data[i][indexName].toString() + " ----- " + data[i][indexEmail] + "\n"

          } else {
            message = "Facility: " + cleanFacility(data[i][indexFacility]) + "\nNumber Of Boxes: " + num_boxes + "\n"
            message += "Contact: " + data[i][indexName].toString() + "\n"
          }
          
          message += "Supplies: " + data[i][indexSupplies].toString() + "\n"
          
          var uploadName = data[i][indexFilename].toString().trim()
          
          if(uploadName.length > 0){
            if(data[i][indexFolderId].toString().trim().length == 0) uploadName = "<NO FOLDER ID> " + uploadName;
            message += "Records Filename:" + uploadName + "\n";
          }
          
          message += "END"
          
          
          if(num_emails < email_num_limit){
            MailApp.sendEmail(recipient,subject,message)
            num_emails += 1
          } else {
            MailApp.sendEmail(debug_email, "HIT EMAIL LIMIT", "PROBABLY A BUG, CHECK THIS OUT")
          }
          
          sheet.getRange((i+1),(indexBerthaSent+1)).setValue(timestamp)

        }
    }
  }
}

function cleanFacility(raw){
  return raw.replace(/&amp;/g,'&')
}
