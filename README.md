### KICKSTARTER

Decentralized application to administer crowdfunding campaigns

#### Dependencies

* npm
* mocha
* solc v0.4.25
* ganache-cli
* web3
* truffle-hdwallet-provider v0.0.3

#### Deploying

The deploy takes two parameters: 

* _addressManager_: the address of the wallet capable of creating request and finalizing them. 
* _minimunContribution_: the minimun amount of wei to become an approver. 

**Observation:** the manager address is received because the manager is *not* the owner of the contract, the deployer is. This is to prevent corruption of the contract. For more information you can read [this](https://github.com/gfilon-quantum/kickstarter/blob/master/soluciones.pdf "solutions") (only in spanish :\ ).

#### Method summary

* _contribute(): void_: the sender becomes a contributor and an approver. The ether sent must be grater than the _minimunContribution_.
* _createRequest(string description, uint amount, address recipient): void_: creates a request. Only the manager specified in the constructor can execute this method. 
* _approveRequest(uint requestNumber): void_: method to approve the request. Only a contributos can execute this method. 
* _viewRequest(uint requestNumber): (string description, uint approvalsCount)_: endpoint to access request information. Anyone can access this information. 
* _finalizeRequest(uint requestNumber): void_: Method to pay off to the provider specified in the creation of the request. This method can only be executed by the manager. The paid will be done only if the request has the majority of the votes of the contributors at the moment that the last of them voted, and the contract shall have enough ether. If ether is not enough, the manager will be able to execute it again in the future. 
* _getBalance()_: returns the balance of the smart contract. 

#### GMF Token

There is a token contract included in this proyect. It is only for experimental purposes as the business logic of the campaign contract does not required any token. 

The token is called *GMF Token* (**GMF**), and it's deployed in the *Ropsten* testnet at the address ``0xae6113f71d8287fd66857fbf8dd954d8889fa8f9``. 
You can "buy" it at a rate of *1 GMF = 1 ETH*. 


#### Author
Gonzalo Martín Filón
gonzalofilon00@gmail.com