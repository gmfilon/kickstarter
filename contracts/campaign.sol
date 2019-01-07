pragma solidity ^0.4.25;

contract Campaign{
    
    struct Request{
        string description;
        uint amount;
        address recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint approvalsAccount;
        bool paid;
    }
    
    address public deployer;
    address public manager;
    uint public minimunContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    mapping(uint => Request) public requests;
    uint public requestsCount;
    
    modifier managerRestricted(){
        require(msg.sender == manager, "You shall be manager to execute this function.");
        _;
    }
    
    modifier contributorRestricted(){
        require(approvers[msg.sender], "You shall be a contributor to execute this function.");
        _;
    }
    
    constructor(address _manager, uint _minimunContr) public{
        deployer = msg.sender;
        manager = _manager;
        approversCount = 0;
        requestsCount = 0;
        minimunContribution = _minimunContr;
    }
    
    function contribute() public payable{
        require(msg.value >= minimunContribution, "Your contribution does not rich the minimun.");
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string description, uint amount, address recipient) public managerRestricted payable{
        Request memory newRequest = Request({
            description : description,
            amount : amount, 
            recipient : recipient,
            complete : false,
            approvalsAccount : 0,
            paid : false
        });
        requests[requestsCount] = newRequest;
        requestsCount++;
    }
    
    function approveRequest(uint requestNumber) public contributorRestricted payable{
        Request storage r = requests[requestNumber];
        require(!r.approvals[msg.sender], "This contributos already voted.");
        r.approvals[msg.sender] = true;
        r.approvalsAccount++;
        r.complete = hasRequestMajority(r.approvalsAccount);
    }
    
    function viewRequest(uint requestNumber) public view returns(string, uint){
        Request storage r = requests[requestNumber];
        return (r.description, r.amount);
    }
    
    function hasRequestMajority(uint alreadyVoted) private view returns(bool) {
        uint needed = approversCount % 2 == 0 ? approversCount/2 : (approversCount/2) + 1;
        return alreadyVoted >= needed;
    }
    
    function finalizeRequest(uint requestNumber) public managerRestricted payable{
        Request storage r = requests[requestNumber];
        require(r.complete, "This request has no majority yet.");
        require(!r.paid, "This request has already been paid off.");
        require(address(this).balance >= r.amount, "There is no enough money to pay this request.");
        r.recipient.transfer(r.amount);
        r.paid = true;
    }
    
    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}