const fs = require('fs')
const csvHandler = require('csv-stringify')
const reportDestination = "./reports/"

/**
 * @description write to a CSV file
 */
function writeToCSVFile(fileName,columns,data){
    try{
        if (fs.existsSync(reportDestination)) {
            csvHandler.stringify(data, { header: true, columns: columns }, (err, output) => {
                if (err) throw err;
                fs.writeFile(reportDestination+"/"+fileName, output, (err) => {
                if (err) throw err;
                    console.log(reportDestination+"/"+fileName +' is saved');
                });
            });
        }
        else{
            console.log("The report destination folder "+reportDestination+ "does not exist, please create it first")
        }
    }catch(e){
        console.log("Exception happens when writting to files")
    }

}

function writeToFile(fileName, content){     
    fs.writeFile(fileName, content, function(err) {
        if (err) {
            console.error(err)
            return
        }
    })
}

module.exports = {writeToCSVFile,writeToFile}