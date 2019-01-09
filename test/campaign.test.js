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
* 5 - Contributor c
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
            gas: '1100000'
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
        it('Wrong amount', async () => {
            assert.throws((campaign) => {campaign.methods.createRequest("Descripcion", 0, accounts[4]).send(
                {
                    from : accounts[1],
                    gas: 1000000
                })});
        });
        it('Not manager', async () => {
            assert.throws((campaign) => {campaign.methods.createRequest("Descripcion", 1, accounts[4]).send(
                {
                    from : accounts[2],
                    gas: 1000000
                })});
        });
        it('Creation successful', async () => {
            await campaign.methods.createRequest("Descripcion", 4, accounts[4]).send(
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

    describe('Approve request', () => {
        it('Can\'t approve: not a contributor', async () => {
            assert.throws((campaign) => {campaign.methods.approveRequest(0).send({from : accounts[1]})});
        });
        it('Approved succesfully', async () => {
            await campaign.methods.approveRequest(0).send({from : accounts[2]});
            const request = await campaign.methods.viewRequest(0).call();
            assert.equal(request[1], 1);
        });
        it('Can\'t approve: contributor already voted', async () => {
            assert.throws((campaign) => {campaign.methods.approveRequest(0).send({from : accounts[2]})});
        });
    });

    describe('Finalize request', () => {
        describe('Can\'t finalize', () => {
            it('Not manager', async () => {
                assert.throws((campaign) => {campaign.methods.finalizeRequest(0).send({from : accounts[2]})});
            });
            it('Not enough ether', async () => {
                assert.throws((campaign) => {campaign.methods.finalizeRequest(0).send({from : accounts[1]})});
            });
            it('No majority', async () => {
                await campaign.methods.contribute().send({from : accounts[3], value: 1});
                await campaign.methods.contribute().send({from : accounts[5], value: 5});
                assert.throws((campaign) => {campaign.methods.finalizeRequest(0).send({from : accounts[1]})});
            });
        });
        it('Finalized succesfully', async () => {
            const initialProviderBalance = await web3.eth.getBalance(accounts[4]);
            await campaign.methods.finalizeRequest(0).send({from : accounts[1]});
            const request = await campaign.methods.viewRequest(0).call();
            assert.equal(parseInt(initialProviderBalance) + 4, await web3.eth.getBalance(accounts[4]));
        });
        it('Already paid', async () => {
            assert.throws((campaign) => {campaign.methods.finalizeRequest(0).send({from : accounts[1]})});
        });
    });
});