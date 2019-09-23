import sys, argparse, json
from copy import copy

def read_template_json():
    with open(args.template[0],mode='r') as f:
        json_dict = json.load(f)
        return json_dict

# we only use the first order and the first line item within that order as a template,
# we then replicate that line item, but update name, bid, keywords, preserving the
# rest of the fields

parser = argparse.ArgumentParser(description='Smaato UB MoPub order generator',
            usage='\n$ python %(prog)s template_file | jsonlint > out.json')

parser.add_argument('template', metavar='template_file', type=str, nargs=1, help='order template file. (e.g. template.json)')

args = parser.parse_args()

input = read_template_json()

order = input['orders'][0]
lineitem_tpl = order['lineItems'][0]

lineitems = []

for i in range(1,101):
    bid = "{:.2f}".format(i*0.1)
    lineitem = copy(lineitem_tpl)
    lineitem['name'] = lineitem_tpl['name'].replace('${bid}',bid)
    lineitem['bid'] = bid
    lineitem['keywords'] = ['smaato_cpm:'+bid]
    lineitems.append(lineitem)

order['lineItems']=lineitems
order['lineItemCount']=len(lineitems)
output = {'name':input['name'], 'orderCount':1, 'lineItemCount':len(lineitems), 'orders':[order]}

print(json.dumps(output))