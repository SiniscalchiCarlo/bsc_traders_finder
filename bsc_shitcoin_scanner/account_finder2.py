from web3 import Web3
from web3.middleware import geth_poa_middleware
import requests as requests
import json
import matplotlib.pyplot as plt
from eth_abi import decode_abi
import time

def get_res(url):
    res=requests.get(url)
    res=json.loads(res.text)["result"]
    return res

def get_tokentxs(address,sort,start,end):
    #restituisce una lista con le transazioni a partire dalla prima considera le transazioni dopo un certo periodo a partire dalla prima
    TotRes=[]
    
    res=requests.get(f'https://api.bscscan.com/api?module=account&action=tokentx&address={address}&startblock={start}&endblock={end}&sort={sort}&apikey={apiKey}')
    res=json.loads(res.text)
    res=res['result']
    
    last_block=None
    if len(res)==10000:
        last_block=res[-1]["blockNumber"]
    return res, last_block

def get_abi(address):
    url = f"https://api.bscscan.com/api?module=contract&action=getabi&address={address}&apikey={apiKey}"
    res=get_res(url)
    abi=json.loads(res)
    return abi

def create_contract(address):
    abi=get_abi(address)
    contract = w3.eth.contract(address=w3.toChecksumAddress(address), abi=abi)
    return contract

def get_tokens_values(contract,data):
    amount0In=int(data["amount0In"])
    amount1In=int(data["amount1In"])
    amount0Out=int(data["amount0Out"])
    amount1Out=int(data["amount1Out"])
    if amount0In!=0:
        t0=amount0In
        t1=-amount1Out
    else:
        t0=-amount0Out
        t1=amount1In

    token0=contract.functions.token0().call()
    token1=contract.functions.token1().call()
    if token0=="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c":
        return t0/10**18
    if token1=="0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c":
        return t1/10**18
    return None

def get_swap(tx_hash):
    transaction_receipt = w3.eth.getTransactionReceipt(tx_hash)
    logs=transaction_receipt["logs"]
    trades=[]
    print("     %s logs"%len(logs))
    for log in logs:

        topic0=w3.toHex(log["topics"][0])
        if topic0=="0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822":
            pair_address=log["address"]
            pair_contract=create_contract(pair_address)
            decoded_data = decode_abi(['uint256', 'uint256', 'uint256','uint256'], bytes.fromhex(log["data"][2:]))
            value=get_tokens_values(pair_contract,decoded_data)
            if value!=None:
                trades.append({"value":value,"pair":pair_address,"block":log["blockNumber"]})  
    return trades

def get_stats(capital,gains,trades_by_pair):
    #biggest drawdow,sharpe ratio,%gain, %avg position, avg numer of trades per token
    #%win
    wins=len([x for x in gains if x > 0])
    perc_gains=[]
    n_trades=[]
    for token in trades_by_pair:
        n_trades.append(len(trades_by_pair[token]))
        trades=trades_by_pair[token]["values"]
        investment=sum([x for x in trades if x < 0])
        gain=sum([x for x in trades if x > 0])
        if investment>0:
            perc_gains.append((gain/investment)-1)
    avg_ntrades_per_token=0
    avg_perc_gain=0
    if len(perc_gains)>0:
        avg_perc_gain=sum(perc_gains)/len(perc_gains)
    if len(n_trades)>0:
        avg_ntrades_per_token=sum(n_trades)/len(n_trades)

    return {"capital":capital, "perc_gains":perc_gains, "%wins":wins/len(gains), 
            "avg_perc_gain":avg_perc_gain,"avg_ntrades_per_token":avg_ntrades_per_token}

def get_address_trades(address,start,min_txs):
    txs,_=get_tokentxs(address,"asc",start,"latest")
    
    if len(txs)<min_txs:
        return None,None,None
    gains=[0] #contiene i guadagni dei trade, per trade considero l-insieme di tutte le volte che si compra o vende lo stesso token. 
              #sommando le perdite e i guadagni comprando o vendendo quel token si ottiene un elemento della lista "gains"
    capital=[0] #l'andamento di ogni buy e sell (non solo del guadagno/perdita efffettiva per trade)
    trades_by_pair={} #dizionario con chiave il pair e come valore tutti i buy e sell relativi al token
    ntxs=len(txs)
    if len(txs)>500:
        txs=txs[:500]
    i=0
    done_txs=[]
    for tx in txs:
        print(tx)
        print("     %s tx of %s"%(i,len(txs)))
        i+=1
        if tx["hash"] not in done_txs:
            done_txs.append(tx["hash"])
            trades=get_swap(tx["hash"]) #prende le informazioni relative allo swap, come quantint' di token scambiati, e address del pair

            for trade in trades:
                capital.append(capital[-1]+trade["value"])
                pair_address=trade["pair"]
                if pair_address not in trades_by_pair:
                    trades_by_pair[pair_address]={"values":[],"blocks":[]}
                trades_by_pair[pair_address]["values"].append(trade["value"])
                trades_by_pair[pair_address]["blocks"].append(trade["block"])
    for pair in trades_by_pair:
        gains.append(gains[-1]+sum(trades_by_pair[pair]["values"]))
    return gains, capital, trades_by_pair

def get_pair_address(token_a, token_b):
    token_a = w3.toChecksumAddress(token_a)
    token_b = w3.toChecksumAddress(token_b)
    pair_address = pancake_factory.functions.getPair(token_a, token_b).call()
    return pair_address
def swaps_by_token(token):
    pair=get_pair_address(token)
    pair_contract=create_contract(pair)


def get_address_trades2(address,start,min_txs):
    wbnb_address="0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"
    txs,_=get_tokentxs(address,"asc",start,"latest")
    
    if len(txs)<min_txs:
        return None,None,None
    gains=[0] #contiene i guadagni dei trade, per trade considero l-insieme di tutte le volte che si compra o vende lo stesso token. 
              #sommando le perdite e i guadagni comprando o vendendo quel token si ottiene un elemento della lista "gains"
    capital=[0] #l'andamento di ogni buy e sell (non solo del guadagno/perdita efffettiva per trade)
    trades_by_pair={} #dizionario con chiave il pair e come valore tutti i buy e sell relativi al token
    pairs_by_token={}
    ntxs=len(txs)
    i=0
    nreq=0
    traded_tokens=[]
    banned=[]
    for tx in txs:
        i+=1
        print(i,ntxs)
        token=tx["contractAddress"]
        block_number=int(tx["blockNumber"])
        print(tx["hash"])
        if token!=wbnb_address and token not in banned:
            if token not in pairs_by_token:
                pair_address=get_pair_address(token,wbnb_address)
                print(pair_address,pair_address=="0x0000000000000000000000000000000000000000")
                if pair_address=="0x0000000000000000000000000000000000000000":
                    print(token,"banned")
                    banned.append(token)
                else:
                    pairs_by_token[token]={"pair_address":pair_address,"contract":create_contract(pair_address)}
                    trades_by_pair[pair_address]=[]
            else:
                pair_address=pairs_by_token[token]["pair_address"]
            if token not in banned:
                pair_contract=pairs_by_token[token]["contract"]
                #get swap informations
                swaps=[]
                nreq+=1
                if nreq==1:
                    start_req=time.time()
                if nreq==6:
                    nreq=0
                    delta=time.time()-start
                    print("sleeping",5-delta)
                    time.sleep(5-delta)
                swaps=pair_contract.events.Swap.createFilter(
                                                    fromBlock=block_number,
                                                    toBlock=block_number).get_all_entries()

                start=time.time()
                for swap in swaps:
                    print(swap)
                    value=get_tokens_values(pair_contract,swap["args"])
                    capital.append(capital[-1]+value)
                    print("VALL",value)
                    if value!=None:
                        trades_by_pair[pair_address].append(value) 
                print("time",time.time()-start)
    print(capital)
    print(trades_by_pair)
    plt.plot(capital)
    plt.show()
    
                
            


def update_data(pairs,done_wallets,traders):
    with open('pairs.json', 'w') as f:
        json.dump(pairs, f)
    with open('wallets.json', 'w') as f:
        json.dump(done_wallets, f)
    with open('traders.json', 'w') as f:
        json.dump(traders, f)

def new_wallets_by_pair(pair,period):
    swaps=swaps_by_pair(pair,period*60)
    new_wallets=[]
    for swap in swaps:
        wallet=swap["args"]["to"]
        if len(new_wallets)<100:
            if wallet not in new_wallets:
                new_wallets.append(wallet)
        else:
            return new_wallets
    
def rabbit_hole(start,min_txs,period,start_pair=""):
    #calcolo il numero del blocco di "start" giorni fa
    start=estimate_block_number(start)

    with open('pairs.json',"r") as f:
        pairs=json.load(f)
    with open('wallets.json',"r") as f:
        done_wallets=json.load(f)
    with open('traders.json',"r") as f:
        traders=json.load(f)
    # se il non ci sono pair salvati, allora crea una lista contenente il pair iniziale in modo che inizi da quello
    if pairs["todo"]==[]:
        pairs["todo"].append(start_pair)
    wallets=[]
    go=True
    found=0
    while go:
        for wallet in wallets:
            if wallet not in done_wallets:
                wallet="0x23eCd30f740a30675231d2Ad177BB7860e51800B"
                print("History of:", wallet)
                done_wallets["done"].append(wallet)
                gains,capital,trades_by_pair=get_address_trades2(wallet,start,min_txs) #PROVARE A CAMBIARE CON TOKENTX
                if gains!=None:
                    pairs["todo"]+=set(list(trades_by_pair.keys()))-set(pairs["todo"])
                
                    stats=get_stats(capital,gains,trades_by_pair)
                    traders["data"].append({wallet:stats})
                    found+=1
                    if found==1:
                        print("Saving data...")
                        found=0
                        update_data(pairs,done_wallets,traders)
        print("Wallets to analy are finished. Finding new ones:")
        #se finiscono i wallet da analizzare allora ne trovo di nuovi
        for pair in pairs["todo"]: #modo intelligente per filtrare token? filtrare token in base a cosa?
            print("     pair:",pair)
            wallets=new_wallets_by_pair(pair,period)
            print("     got %s new wallets."%(len(wallets)))
            if len(wallets)>=100:
                break

def estimate_block_number(days_ago):
    average_block_time_seconds = 3 
    seconds_per_day = 86400
    blocks_per_day = seconds_per_day / average_block_time_seconds
    blocks_ago = int(days_ago * blocks_per_day)
    current_block_number = w3.eth.block_number
    return current_block_number - blocks_ago

def swaps_by_pair(pair_address,period):
    cotract=create_contract(pair_address)
    #prendo le prime transazioni per vedere in che blocco è stata fatta la prima transazione sul pair, in modo da incominciare a cercare gli swap da quel blocco
    txs,_=get_tokentxs(pair_address,"asc",0,"latest")
    first_swap_time=int(txs[0]["timeStamp"])
    first_swap_block=int(txs[0]["blockNumber"])
    last_swap_time=first_swap_time
    #continuo a prendere swap dal primo swap fino a dopo "period" millisecondi
    from_block=first_swap_block
    all_swaps=[]
    while(last_swap_time<first_swap_time+period):
        swap_events = cotract.events.Swap().createFilter(fromBlock=from_block, toBlock=from_block+5000).get_all_entries()
        if swap_events!=[]:
            all_swaps+=swap_events
            last_swap_block=w3.eth.getBlock(swap_events[-1]['blockNumber'])
            last_swap_time=last_swap_block['timestamp']
            from_block=swap_events[-1]['blockNumber']
        #se ho raccolto più di 100 swap esco dal while, perchè ho raccolto abbastanza wallet 
        #(tanto dopo nella funzione rabbit hole aggiungo wallet alla lista new_wallet soltanto se la lista ha meno di 100 elementi)
        if len(all_swaps)>100:
            break
        time.sleep(1)
    return all_swaps

apiKey="UD3VYUKCWS42FIIMU82XAZQADYYJZE7M8R"
w3 = Web3(Web3.HTTPProvider('https://bsc-dataseed.binance.org/'))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
routers=["0x10ED43C718714eb63d5aA57B78B54704E256024E","0x1A0A18AC4BECDDbd6389559687d1A73d8927E416"]
pancake_factory=create_contract('0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73')
rabbit_hole(60,100,60,"0xdde0a4A7c05636228349eECF1F1208eB0c63554C")

#PROVARE A CAMBIARE CON TOKENTX

#TODO
#Aggiungere asse del tempo a capital e gains

#FILTRI WALLET
#considerare solo wallet che comprano qualche X minuti dipo la creazione 

#STATISTICHE WALLET:
#tempo medio entrata dopo aggiunta liquidità token

#STATISTICHE TOKENS:
#quante volte è stata aggiunta la liquidità e di quanto

#MONITORARE CHI CREA SHITCOIN E CAPIRE COME FA A GUADAGNARE
#STATISTICHE SHITCOIN
#filtrare txs live di un wallet https://ethereum.stackexchange.com/questions/93067/python-web3-contract-filtering