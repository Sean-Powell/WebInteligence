import xml.etree.ElementTree

import Document


def parseFile(file_location):
    documents = []
    e = xml.etree.ElementTree.parse(file_location).getroot()
    x = 0
    for thread in e.findall('thread'):
        name = thread.findall('name')

        for DOC in thread.findall('DOC'):
            print("DOC count " , x)

            Debug_ID = DOC.findall('EmailID')
            if len(Debug_ID) != 0:
                Debug_ID = Debug_ID[0].text

            To = DOC.findall('To')
            From = DOC.findall('From')
            Cc = DOC.findall('Cc')

            content = ""

            for Text in DOC.findall('Text'):
                content = Text.findall('content')
                if not content[0].text:
                    content[0].text = ""

            to_split = To[0].text.split(",")

            emails = []

            for email in to_split:
                emails.append(email)

            if len(Cc) != 0:
                cc_split = Cc[0].text.split(",")
                for email in cc_split:
                    emails.append(email)

            emails = extractEmail(emails)
            From = extractEmail([From[0].text])
            From = From[0]

            email_counter = 0

            for email_a in emails:
                        email_counter += 1
                        found_doc = False
                        y = 0
                        for document in documents:
                            y += 1
                            if (document.user_1 == From and document.user_2 == email_a) or\
                               (document.user_1 == email_a and document.user_2 == From):
                                found_doc = True
                                document.appendtocontent(content[0].text)
                                print("Appending: ", content[0].text, " to doc: ", y)

                        if not found_doc:
                            new_doc = Document.DocumentObj(name[0].text, From, email_a, content[0].text)
                            documents.append(new_doc)

            x = x + 1
    print("Final Doc Count: ", x)
    return documents


def extractEmail(emails):
    extracted_emails = []
    for email in emails:
        start = email.find("<")
        end = email.find(">")

        if start != -1 and end != -1:
            extracted_emails.append(email[(start + 1):end])
        else:
            extracted_emails.append(email)

    return extracted_emails
