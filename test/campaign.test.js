const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let accounts;
let inbox;
const initialMessage = 'Hello mundo ;)';

before( async () => {

    
    accounts = await web3.eth.getAccounts();
    console.log("Accounts->", accounts);
    inbox = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode,
            arguments: ['0xad4E12013e5925B5BFe07c2cf827eF6C4465A86F', '1']
        })
        .send({
            from: accounts[0],
            gas: '1000000'
        });
});

describe('InboxTest', () => {
    it('Deploy the contract', () => {
        assert.ok(inbox.options.address);
    });

    // it('Has a default message', async () => {
    //     const message = await inbox.methods.getMessage().call();
    //     assert.equal(message, 'Hello mundo ;)');
    // });

    // it('Can change the message', async () => {
    //     await inbox.methods.setMessage('All good').send({from : accounts[0]});
    //     const message = await inbox.methods.getMessage().call();
    //     assert.equal(message, 'All good');
    // });
});