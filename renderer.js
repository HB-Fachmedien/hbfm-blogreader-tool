// von Stefan Maibücher

const fs = require('fs');
const builder = require('xmlbuilder');
const $ = require("jquery");
const moment = require("moment");

const moeglicheRubriken = ['Abgabenordnung', 'Abschlussprüfung', 'Aktienrecht', 'Allgemeine BWL', 'Allgemeine Geschäftsbedingungen', 'Arbeitsförderung', 'Arbeitnehmerhaftung', 'Arbeitnehmerüberlassung', 'Arbeitskampfrecht', 'Arbeitsschutzrecht', 'Arbeitsvertragsrecht', 'Arbeitszeitrecht', 'Bankrecht', 'Befristigungsrecht', 'Behindertenrecht', 'Berufsbildungsrecht', 'Betriebliche Altersversorgung', 'Betriebsübergang', 'Betriebsverfassungsrecht', 'Bewertungsgesetz', 'Bilanzanalyse', 'Bilanzsteuerrecht', 'Controlling', 'Corporate Governance', 'Datenschutz', 'Eigenheimzulage', 'Einkommensteuer', 'Elternrecht', 'Entgeltrecht', 'Erbschaft-/Schenkungsteuer', 'Europarecht', 'Factoring', 'Finanzgerichtsordnung', 'Finanzierung', 'Franchising', 'Genossenschaftsrecht', 'Gewerbesteuer', 'Gewinnermittlung', 'Gleichbehandlung', 'Gmbh-Recht', 'Grunderwerbsteuer', 'Grundgesetz', 'Grundsteuer', 'Haftungsrecht', 'Handelsbilanzrecht', 'Handelsrecht', 'Handelsvertreterrecht', 'IFRS', 'Insolvenzrecht', 'Internationales Privatrecht', 'Internationales Steuerrecht', 'Investitionszulage', 'Investor Relations', 'Kapitalanlage', 'Kapitalertragsteuer', 'Kapitalmarktrecht', 'Kartellrecht', 'Kirchensteuer', 'Koalitionsrecht', 'Körperschaftsteuer', 'Kreditsicherungsrecht', 'Kündigungsrecht', 'Leasing', 'Limited', 'Lohnsteuer', 'Mitbestimmungsrecht', 'Notarrecht', 'Öffentlicher Dienst', 'Personengesellschaftsrecht', 'Produkthaftung', 'Rechnungslegung', 'Rechtsanwaltsrecht', 'Schuldrecht', 'Solidaritätszuschlag', 'Sonstige BWL', 'Sonstige Steuerarten', 'Sonstiges Beratung', 'Sonstiges Recht', 'Sozialversicherung', 'Steuerberaterrecht', 'Steuerstrafrecht', 'Strafrecht', 'Tarifvertragsrecht', 'Teilzeitrecht', 'Umsatzsteuer', 'Umwandlungsrecht', 'Umwandlungssteuerrecht', 'Unfallversicherung', 'Unternehmensbewertung', 'Unternehmenskauf', 'Unternehmensorganisation', 'Urlaubsrecht', 'Verbraucherrecht', 'Verfahrensrecht', 'Versicherungsrecht', 'Wettbewerbsrecht', 'Wettbewerbsverbot', 'Wirtschaftsprüferrecht', 'Zollrecht', 'Zwangsvollstreckung'];

var body = '';
var mapping = {};

// Output Ordner erstellen, falls nicht vorhanden
var dir = './output';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

resetData();

function resetData() {
    console.log('Data Reset...');

    body = '';
    mapping = {
        // html <--> xml Mapping
        nbb: {
            metadata: {
                'title': '',
                'authors': {
                    'author': [],
                    'biography': ''
                },
                'ressort': '',
                '#comment': 'Rubriken nochmals überprüfen:',
                'rubriken': {},
                'pub': {
                    'pubtitle': '',
                    'pubabbr': 'DB',
                    'pubyear': '',
                    'pubedition': '',
                    'date': '',
                    'pages': {
                        'start_page': '',
                        'article_order': 1
                    }
                },
                'all_doc_type': {
                    '@level': 1,
                    '#text': 'nb'
                },
                'all_source': [{
                    '@level': 1,
                    '#text': 'news'
                }, {
                    '@level': 2,
                    '#text': 'rb'
                }]
            }
        }
    }
}

fillMappingObject = function(data, date, welches_board) {
    var $entry = $(data).find('div#content').first();
    var $meta = $entry.find('footer.entry-meta').first();

    //console.dir($entry);
    mapping.nbb.metadata.title = $entry.find('h1.entry-title').first().text();

    var $autoren = $meta.children('a:contains(",")');
    //console.log($autoren);

    let biography = '';

    var dateiname = 'BLOG_' + moment(date).format('YYYYMMDD') + '_';

    let bioPrefix = '';

    $autoren.each(function(index, el) {
        let vorname = $.trim($(this).text().split(',')[1]);
        let nachname = $.trim($(this).text().split(',')[0]);
        //console.log("vn: " + vorname);
        //console.log("nn: " + nachname);
        if (index !== 0) {
            dateiname += '-';
        }
        dateiname += nachname.replace('ß','ss').replace(' ', '_');

        // Versuch, die Autoreninfos aus dem String zu matchen
        let comment = 'Autoreninfos: ' + $entry.find('p.wp-caption-text').first().text();

        let einzelnde_autoren_array = $entry.find('p.wp-caption-text').first().text().split(" und");

        //console.log(einzelnde_autoren_array);
        //console.log(nachname);

        let zu_untersuchen = '';

        for (var i = 0; i < einzelnde_autoren_array.length; i++) {
            console.log(einzelnde_autoren_array[i].includes(nachname));
            if (einzelnde_autoren_array[i].includes(nachname)) {
                zu_untersuchen = einzelnde_autoren_array[i];
                break;
            }
        }

        let prefix = '';

        if (zu_untersuchen !== '') {
            let regex_string_vor_vornamen = new RegExp("(.*?)" + vorname + ".*");
            //console.log('regex_string_vor_vornamen');
            //console.log(regex_string_vor_vornamen);
            prefix = $.trim(zu_untersuchen.replace(regex_string_vor_vornamen, "$1"));

        } else {
            console.warn("Probleme beim Autoreninfos parsen...");
        }

        let regex_biography = /.*,(.*?,.*)/g;

        biography = $.trim(einzelnde_autoren_array[einzelnde_autoren_array.length - 1].replace(regex_biography, '$1'));

        mapping.nbb.metadata.authors.author.push({
            '#comment': comment,
            'prefix': prefix,
            'firstname': vorname,
            'surname': nachname,
            'suffix': ''
        });

        bioPrefix += $.trim(prefix) + ' ' + $.trim(vorname) + ' ' + $.trim(nachname) + ' ';
    });

    dateiname += '.xml';

    if (!biography.startsWith(',')) {
        bioPrefix = $.trim(bioPrefix) + ' ';
    }else{
        bioPrefix = $.trim(bioPrefix);
    }

    mapping.nbb.metadata.authors.biography = {
        //'p': biography
        'p' : {
            'b': bioPrefix,
            '#text' : biography
        }
    };

    let ressort_schluesselwoerter = '';

    $meta.children('a').each(function(index, el) {
        console.log("res-text: " + $(this).text());
        if ($(this).text() === 'Arbeitsrecht' || $(this).text() === 'Steuerrecht' || $(this).text() === 'Wirtschaftsrecht') {
            ressort_schluesselwoerter = $(this).text();
        }
    });

    console.log('Als Ressort wurde ermittelt: ***');
    console.dir(ressort_schluesselwoerter);

    if (welches_board === 'steuerboard') {
        mapping.nbb.metadata.ressort = 'sr';
        mapping.nbb.metadata.pub.pubtitle = 'Steuerboard-Blog';
        mapping.nbb.metadata.all_source[1] = {
            '@level': 2,
            '#text': 'sb'
        };
    } else {
        switch (ressort_schluesselwoerter) {
            case 'Arbeitsrecht':
                mapping.nbb.metadata.ressort = 'ar';
                break;
            case 'Wirtschaftsrecht':
                mapping.nbb.metadata.ressort = 'wr';
                break;
            default:
                // in der Tag-Cloud suchen:
                $(data).find('p.post_tag-cloud.term-cloud').children('a').each(function(index, el) {
                    if ($(this).text() === 'Arbeitsrecht') {
                        mapping.nbb.metadata.ressort = 'ar';
                    } else if ($(this).text() === 'Steuerrecht') {
                        mapping.nbb.metadata.ressort = 'sr';
                    } else if ($(this).text() === 'Wirtschaftsrecht') {
                        mapping.nbb.metadata.ressort = 'wr';
                    }
                });
        }
        mapping.nbb.metadata.pub.pubtitle = 'Rechtsboard-Blog';
    }

    var rubriken = {
        'rubrik': []
    };

    $meta.children('a[rel="tag"]').each(function(index, el) {
        let rub = $.trim($(this).text());
        if (moeglicheRubriken.includes(rub)) {
            var tempObject = {
                '#text': rub
            };
            rubriken.rubrik.push(tempObject);
        }
    });
    mapping.nbb.metadata.rubriken = rubriken;
    //console.log('Als Rubriken wurden ermittelt: ' + rubriken);

    mapping.nbb.metadata.pub.pubyear = moment(date).format('YYYY');

    mapping.nbb.metadata.pub.date = moment(date).format('YYYY-MM-DD');

    console.log('Start:');

    body += $entry.find('div.entry-content').html();

    var regex_delete_comments = /\/\*.*?\*\//gm;
    var regex_delete_div = /\<div(.*?\n?)*?<\/div>/gm;
    var regex_delete_a_tags = /<a href=".*?">(.*?)<\/a>/g;
    var regex_delete_empty_spans = /<span.*?>(.*?)<\/span>/g;
    var regex_replace_p_strongs = /<p><strong>(.*?)<\/strong><\/p>/g;
    var regex_replace_h2 = /h2>/g;
    var regex_replace_ul = /<[o|u]l>/g;
    var regex_replace_ul_end = /<\/[o|u]l>/g;
    var regex_replace_li = /<li>/g;
    var regex_replace_li_end = /<\/li>/g;
    var regex_replace_em = /<em>/g;
    var regex_replace_em_end = /<\/em>/g;
    var regex_replace_strong = /<strong>/g;
    var regex_replace_strong_end = /<\/strong>/g;
    var regex_replace_nbsp = /&nbsp;/g;
    var regex_replace_open_br = /<br>/g;

    body = body.replace(regex_delete_comments, '')
        .replace(regex_delete_div, '')
        .replace(regex_delete_a_tags, '$1')
        .replace(regex_delete_empty_spans, '$1')
        .replace(regex_replace_p_strongs, '<subhead>$1<\/subhead>')
        .replace(regex_replace_h2, 'subhead>')
        .replace(regex_replace_ul, '<list type="bullet">')
        .replace(regex_replace_ul_end, '<\/list>')
        .replace(regex_replace_li, '<listitem><p>')
        .replace(regex_replace_li_end, '<\/p><\/listitem>')
        .replace(regex_replace_em, '<i>')
        .replace(regex_replace_em_end, '<\/i>')
        .replace(regex_replace_strong, '<b>')
        .replace(regex_replace_strong_end, '<\/b>')
        .replace(regex_replace_nbsp, '&#160;')
        .replace(regex_replace_open_br, '<br\/>'); // oder mit jQuery alle ELemente entfernen?

    return new Promise(function(resolve, reject) {
        resolve(dateiname);
    });
}

function zeigeBlogeintraege(url) {
    $("#blogeintraege").rss(url, {
        limit: 10,
        entryTemplate: '<li class="eintrag" data-url="{url}" data-date={date}><p><i>"{title}"<i> von: <b>{author}</b></p></li>',
        dateLocale: "de",
        effect: "show"
    }, function() {
        $(".eintrag").on("click", function(e) {
            console.log("List-Item angeklickt...");
            console.dir(e.currentTarget);
            getDatafromBlogEntry(e.currentTarget.dataset.url, e.currentTarget.dataset.date);
        })
    });
}

$('#boardauswahl').on('click', function(event) {
    event.preventDefault();
    var selected = $("input[type='radio'][name='options']:checked").val();
    var url = selected == 1 ? "http://blog.handelsblatt.com/steuerboard/feed/" : "http://blog.handelsblatt.com/rechtsboard/feed/";
    //console.log(url);
    $('#blogeintraege').empty();
    zeigeBlogeintraege(url);
});

$('#url-eingeben').on('click', function(event) {
    event.preventDefault();
    let input = $('#url-input-feld').val();

    console.log();
    if (input === '') {
        console.warn("kein Text input - lieber tooltip...");
    }else{
        getDatafromBlogEntry(input, undefined);
    }
});

getDatafromBlogEntry = function(url, date) {
    resetData();

    // date wird bei direkter URL Eingabe nicht mit übergeben, wird in der URL geparsed:
    if (date == undefined) {
        let url_splitted = url.split('/');
        //console.log(url_splitted);
        date = moment(url_splitted[6]+url_splitted[5]+url_splitted[4], 'DDMMYYYY').format();
    }

    var welches_board = url.split('/')[3];

    $.ajax({
        url: url,
        dataType: 'html',
        success: function(data) {
            console.log("Blog Eintrag Daten erfolgreich geladen.");
            fillMappingObject(data, date, welches_board).then(function(dateiname) {
                console.log("Success! Dateiname: ", dateiname);
                html2Xml(dateiname);
            }, function(error) {
                console.error("Failed!", error);
            });
        }
    });
}

html2Xml = function(dname) {
    var options = {
        rootName: 'nbb',
        doctype: {
            'sysID': 'hbfm.dtd'
        },
        xmldec: {
            'version': '1.0',
            'encoding': 'UTF-8'
        }
    };
    fs.writeFile('output/' + dname, builder.create(mapping, {
            version: '1.0',
            encoding: 'UTF-8'
        }).ele('body').raw(body)
        .dtd('-//Handelsblatt Fachmedien//DTD V1.0//DE', 'hbfm.dtd').end({
            pretty: true
        }), (err) => {
            if (err) throw err;
            console.log('XML Datei gespeichert!');
        });

    // App Reload nach dem Schreiben der Datei...
    location.reload();
}
