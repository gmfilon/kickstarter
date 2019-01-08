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
            const balanceAux = await campaign.methods.getBalance().call();
            assert.equal(balanceAux, 1);
        });
    });

    describe('Create request', () => {
        /*
        * no se pueden testear por un problema en la estimación de gas de ganache cli
        */
        // it('Wrong amount', async () => {
        //     assert.throws((campaign) => {campaign.methods.createRequest().send(
        //         {
        //             from : accounts[1], 
        //             arguments: [
        //                 "", 
        //                 0, 
        //                 accounts[2]
        //             ]
        //         })});
        // });
        // it('Wrong address', async () => {
        //     assert.throws((campaign) => {campaign.methods.createRequest().send(
        //         {
        //             from : accounts[1], 
        //             arguments: [
        //                 "", 
        //                 1, 
        //                 0x0
        //             ]
        //         })});
        // });
        it('Not manager', async () => {
            assert.throws((campaign) => {campaign.methods.createRequest("Descripcion", 1, accounts[4]).send(
                {
                    from : accounts[2]
                })});
        });
        it('Creation successful', async () => {
            await campaign.methods.createRequest("Descripcion", 1, accounts[1]).send(
                {
                    from : accounts[1], 
                    value: 1000,
                    gas: 1000000
                }
            );
            const requestsCount = await campaign.methods.requestsCount().call();
            assert.equal(requestsCount, 1);
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