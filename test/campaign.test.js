const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let accounts;

/*
* Accounts:
* 0 - Deployer
* 1 - Manager
* 2 - Contributor a
* 3 - Contriburor b
* 4 - Provider to be paid
*/

before( async () => {

    accounts = await web3.eth.getAccounts();
    campaign = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: bytecode,
            arguments: [accounts[1], '1']
        })
        .send({
            from: accounts[0],
            gas: '1000000'
        });
});

describe('Campaign', () => {
    it('Deploy the contract', () => {
        assert.ok(campaign.options.address);
    });

    describe('Become approver', () => {
        it('Can\'t become approver: no ether sent', async () => {
            assert.throws((campaign) => {campaign.methods.contribute().send({from : accounts[2]})});
        });
        it('Become approver', async () => {
            await campaign.methods.contribute().send({from : accounts[2], value: 1});
            const approversCount = await campaign.methods.approversCount().call();
            assert.equal(approversCount, 1);
        });
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