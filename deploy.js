const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    '',
    ''
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ 
            data : bytecode, 
            arguments : ['0xad4E12013e5925B5BFe07c2cf827eF6C4465A86F','1']
        })
        .send({ gas : '5000000', from: accounts[0] });
    
    console.log('Contract deployed to', result.options.address);
};

deploy();
