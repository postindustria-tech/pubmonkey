import sys, json

if len(sys.argv) < 3:
    print 'usage: ' + sys.argv[0] + ' template.json data.json > output.json\n\n'
    sys.exit()

template = json.load(open(sys.argv[1]))
data = json.load(open(sys.argv[2]))

etalon = template['orders'][0]['lineItems'][0]

fields_with_macros = [key for key, value in etalon.items() if type(value) == unicode and value.find('{bid}') != -1]

output = []

for bid in data:
    item = etalon.copy()

    for key in fields_with_macros:
        item[key] = item[key].replace('{bid}', str(bid))

    output.append(item)

template['orders'][0]['lineItems'] = output

print json.dumps(template, indent=4)
