src="d3-cloud-master/index.js";

//todo 155 nodes 
function Document(content, user_1, user_2, tfidf) {
    this.content = content;
    this.user_1 = user_1;
    this.user_2 = user_2;
    this.tfidf = tfidf;
}

function TermFreq(term, frequency) {
    this.term = term;
    this.frequency = frequency;
}

function IDF(term, idfValue) {
    this.term = term;
    this.idfValue = idfValue;
}

function TFIDF(term, frequency) {
    this.term = term;
    this.frequency = frequency;
}


var wordCloudData = [];


function getData() {
    var documents = [];

    //not ideal solution to turn of async, would be better to implement await
    $.ajaxSetup({
        async: false
    });

    //not great to directly load the .json file call python first
    $.getJSON('Python/data.json', function (data) {
        $.each(data, function (index, value) {
            var doc = new Document(value.content, value.user_1, value.user_2, null);
            documents.push(doc);
        });
    });

    $.ajaxSetup({
        async: true
    });

    return documents;
}


function parseData() {
    var data = getData();
    data = cleanData(data);
    data = removeStopWords(data);
    data = stemData(data);
    var termFrequencies = calculateTermFrequency(data); //datatype = term|freq (corrected for doc length)
    console.log("Term frequ: ");
    console.log(termFrequencies);
    var uniqueTerms = getListOfUniqueTerms(data);
    console.log(uniqueTerms);

    var idf = calculateIDF(termFrequencies, uniqueTerms);
    console.log(idf);

    var tfidfs = calculateTFIDF(termFrequencies, idf);
    console.log(tfidfs);

    for (let i = 0; i < data.length; i++) {
        data[i].tfidf = tfidfs[i];
    }

    console.log(data);
    wordCloudData = data;

    createWordCloud(data[7].user_1, data[7].user_2);
}

function cleanData(data) { //removes all symbols and extra white spaces
    for (let i = 0; i < data.length; i++) {
        data[i].content = data[i].content.replace(/[^a-zA-Z ]/g, "");
        data[i].content = data[i].content.replace(/\s+/g, ' ');
        data[i].content = data[i].content.toLowerCase();
        data[i].content = data[i].content.trim();
    }
    return data;
}


function stemData(data) {
    // $.getScript("PorterStemmer/PorterStemmer1980.js", function () {
    for (let i = 0; i < data.length; i++) {
        let newData = "";
        data[i].content = data[i].content.trim();
        var splitContent = data[i].content.split(" ");
        let lastIndex = splitContent.length - 1;
        for (let j = 0; j < splitContent.length; j++) {
            let stemmed = "";
            let toStem = splitContent[j];
            toStem = toStem.trim();
            stemmed = stemmer(toStem);
            if (j === lastIndex) {
                newData = newData + stemmed;
            } else {
                newData = newData + stemmed + " ";
            }

        }

        data[i].content = newData;
    }
    // });
    return data;
}


function removeStopWords(data) {
    //stop words from https://github.com/Yoast/YoastSEO.js/blob/develop/src/config/stopwords.js
    let stopWords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as",
        "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do",
        "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
        "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
        "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "it", "it's", "its", "itself", "let's",
        "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours",
        "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such",
        "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these",
        "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
        "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's",
        "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd",
        "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];

    for (let i = 0; i < data.length; i++) {
        let newData = "";
        let splitData = data[i].content.split(" ");

        let lastIndex = splitData.length - 1;
        for (let j = 0; j < splitData.length; j++) {
            let found = false;
            for (let k = 0; k < stopWords.length; k++) {
                splitData[j] = splitData[j].trim();
                if (splitData[j] === stopWords[k]) {
                    found = true;
                    k = stopWords.length;
                }
            }

            if (!found) {
                if (j === lastIndex) {
                    newData = newData + splitData[j];
                } else {
                    newData = newData + splitData[j] + " ";
                }
            }
        }
        data[i].content = newData;
    }
    return data;
}

function getListOfUniqueTerms(data) {
    console.log(data);
    let terms = [];

    let listOfSplitContents = [];

    for (let i = 0; i < data.length; i++) {//splits all the contents into their stemmed words
        listOfSplitContents.push(data[i].content.split(" "));
    }

    for (let i = 0; i < listOfSplitContents.length; i++) {
        let currentDocument = listOfSplitContents[i];
        for (let j = 0; j < currentDocument.length; j++) {
            let currentWord = currentDocument[j];
            currentWord = currentWord.trim();
            let found = false;
            for (let k = 0; k < terms.length; k++) {
                if (terms[k] === currentWord) {
                    found = true;
                }
            }

            if (!found) {
                terms.push(currentWord);
            }
        }
    }

    return terms;
}

function calculateTermFrequency(data) { //todo find and fix bug
    let tfList = [];

    for (let i = 0; i < data.length; i++) {
        let splitContent = data[i].content.split(" ");
        let term = [];
        let termCount = [];
        let documentLength = splitContent.length;
        for (let j = 0; j < documentLength; j++) {
            let currentTerm = splitContent[j];
            let found = false;
            for (let k = 0; k < term.length; k++) {
                if (currentTerm === term[k]) {
                    found = true;
                    termCount[k]++;
                    k = term.length;
                }
            }

            if (!found) {
                term.push(currentTerm);
                termCount.push(1);
            }
        }

        let docTf = [];
        for (let j = 0; j < term.length; j++) {
            let tf = new TermFreq(term[j], termCount[j] / documentLength);
            docTf.push(tf);
        }

        tfList.push(docTf);
    }
    return tfList;
}

function calculateIDF(TFs, uniqueTerms) {
    let idf = [];
    for (let i = 0; i < uniqueTerms.length; i++) {
        let documentCount = 0;
        for (let j = 0; j < TFs.length; j++) {
            let currentList = TFs[j];
            for (let k = 0; k < currentList.length; k++) {
                if (currentList[k].term === uniqueTerms[i]) {
                    documentCount++;
                    k = currentList.length;
                }
            }
        }

        idf.push(new IDF(uniqueTerms[i], Math.log(TFs.length / documentCount)));
    }

    idf.sort(function (a, b) {
        return a.term > b.term;
    });
    return idf;
}


function calculateTFIDF(tfs, idfs) {
    let documents = [];
    for (let i = 0; i < tfs.length; i++) {
        let currentList = tfs[i];
        let freqList = [];
        for (let j = 0; j < currentList.length; j++) {
            let currentTerm = currentList[j];
            for (let k = 0; k < idfs.length; k++) {
                let currentIDF = idfs[k];
                if (currentTerm.term === currentIDF.term) {
                    let tfidf = new TFIDF(currentTerm.term, currentTerm.frequency * currentIDF.idfValue);
                    k = idfs.length;
                    freqList.push(tfidf);
                }
            }
        }

        freqList.sort(function (a, b) {
            return a.frequency < b.frequency;
        });
        documents.push(freqList);
    }

    return documents;
}

//todo make word clouds

function createWordCloud(user_1, user_2) {
    let w = 1000, h = 500;
    let percentage = 20;
    let defaultSize = 400;
    let word_list = [];
    for (let i = 0; i < wordCloudData.length; i++) {
        if ((user_1 === wordCloudData[i].user_1 && user_2 === wordCloudData[i].user_2) ||
            (user_2 === wordCloudData[i].user_2 && user_2 === wordCloudData[i].user_1)) {
            let list = wordCloudData[i].tfidf;
            for (let j = 0; j < Math.round(((list.length / 100) * percentage)); j++) {
                let newWord = {"text": list[j].term, "size": (defaultSize * list[j].frequency)};
                word_list.push(newWord);
            }
            console.log("Word_list: ");
            console.log(word_list);

            var color = d3.scaleLinear()
                .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
                .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

            d3.layout.cloud().size([w, h])
                .words(word_list)
                .rotate(0)
                .fontSize(function (d) {
                    return d.size;
                })
                .on("end", draw)
                .start();

            function draw() {
                d3.select("body").append("svg")
                    .attr("width", 850)
                    .attr("height", 350)
                    .attr("class", "wordcloud")
                    .append("g")
                    // without the transform, words words would get cutoff to the left and top, they would
                    // appear outside of the SVG area
                    .attr("transform", "translate(320,200)")
                    .selectAll("text")
                    .data(word_list)
                    .enter().append("text")
                    .style("font-size", function (d) {
                        return d.size + "px";
                    })
                    .style("fill", function (d, i) {
                        return color(i);
                    })
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function (d) {
                        return d.text;
                    });
            }

        }
    }
}

function DrawWordCloud(user_1, user_2){
    let w = 600, h = 400;
    let percentage = 20;
    let defaultSize = 40;
    let word_list = [];

    for (let i = 0; i < wordCloudData.length; i++) {
        if ((user_1 === wordCloudData[i].user_1 && user_2 === wordCloudData[i].user_2) ||
            (user_2 === wordCloudData[i].user_2 && user_2 === wordCloudData[i].user_1)) {
            let list = wordCloudData[i].tfidf;

            $.ajaxSetup({
                async: false
            });


            $.getScript("d3-cloud-master/build/d3.layout.cloud.js", function(){
                for (let j = 0; j < Math.round(((list.length / 100) * percentage)); j++) {
                    let newWord = {"text": list[j].term, "size": (defaultSize * list[j].frequency)};
                    word_list.push(newWord);
                }
                console.log("Word_list: ");
                console.log(word_list);

                var fill = d3.scale.category20();

                var color = d3.scale.linear()
                    .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
                    .range(["#ff0000", "#3543e8", "#ffbb00", "#5ae216", "#e216d7"]);

                d3.layout.cloud().size([w, h])
                    .words(word_list)
                    .rotate(0)
                    .fontSize(function (d) {
                        return d.size;
                    })
                    .on("end", draw)
                    .start();

                function draw() {
                    d3.select("body").append("svg")
                        .attr("width", w)
                        .attr("height", h)
                        .attr("class", "wordcloud")
                        .append("g")
                        // without the transform, words words would get cutoff to the left and top, they would
                        // appear outside of the SVG area
                        .attr("transform", "translate(320,200)")
                        .selectAll("text")
                        .data(word_list)
                        .enter.append("text")
                        .style("font-size", function (d) {
                            return d.size + "px";
                        })
                        .style("fill", function(d, i) { return fill(i); })
                        .attr("transform", function (d) {
                            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .text(function (d) {
                            return d.text;
                        });
                }
            });

            $.ajaxSetup({
                async: true
            });

        }
    }
}
parseData();