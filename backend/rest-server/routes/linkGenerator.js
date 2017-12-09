
function generateLinks(links){

    var result = {};
    for (var prop in links) {

        // skip loop if the property is from prototype
        if(!links.hasOwnProperty(prop)) continue;

        // your code
        result[prop] = {href: links[prop]};
    }


    return result;
}

module.exports = generateLinks;