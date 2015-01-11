//
//  User.swift
//  EnjoyPnD
//
//  Created by Brian Vallelunga on 1/10/15.
//  Copyright (c) 2015 Brian Vallelunga. All rights reserved.
//

private var selectCompanies: NSMutableArray = NSMutableArray()
private var pendCompanies: NSMutableArray = NSMutableArray()

class User {
    
    // MARK: Instance Variables
    var username: String!
    var name: String!
    var email: String!
    var description: String!
    var selectedCompanies: NSMutableArray = selectCompanies
    var pendingCompanies: NSMutableArray = pendCompanies
    var parse: PFUser!
    
    // MARK: Convenience Methods
    convenience init(_ user: PFUser) {
        self.init()
        
        self.parse = user
        self.username = user["username"] as? String
        self.email = user["email"] as? String
        self.description = user["description"] as? String
    }
    
    // MARK: Class Methods
    class func login(email: String, password: String, callback: ((success: Bool) -> Void)) {
        PFUser.logInWithUsernameInBackground(email, password: password) {
            (user: PFUser!, error: NSError!) -> Void in
            callback(success: user != nil && error == nil)
        }
    }
    
    class func register(email: String, password: String, callback: ((success: Bool) -> Void)) {
        var user = PFUser()
        user.email = email
        user.username = email
        user.password = password
        
        user.signUpInBackgroundWithBlock { (success: Bool, error: NSError!) -> Void in
            callback(success: success && error == nil)
        }
    }
    
    class func current() -> User! {
        if let user = PFUser.currentUser() {
            return User(user)
        } else {
            return nil
        }
    }
    
    class func logout() {
        if PFUser.currentUser() != nil {
            PFUser.logOut()
        }
    }
    
    // MARK: Instance Methods
    func logout() {
        PFUser.logOut()
    }
    
    func setInfo(name: String, description: String) {
        self.parse["name"] = name
        self.parse["description"] = description
        self.parse.saveInBackgroundWithBlock(nil)
    }
    
    func getCompanies(callback: ((companies: [Company]) -> Void)) {
        var companies: [Company] = []
        var query = PFQuery(className: "Company")
        
        query.whereKey("workers", equalTo: self.parse)
        
        query.findObjectsInBackgroundWithBlock({ (objects: [AnyObject]!, error: NSError!) -> Void in
            if error == nil {
                for object in objects as [PFObject] {
                    companies.append(Company(object))
                }
                
                callback(companies: companies)
            } else if error != nil {
                println(error)
            }
        })
    }
    
    func getPendingCompanies(callback: ((companies: [Company]) -> Void)) {
        var companies: [Company] = []
        var query = PFQuery(className: "Company")
        
        query.whereKey("workers", notEqualTo: self.parse)
        
        query.findObjectsInBackgroundWithBlock({ (objects: [AnyObject]!, error: NSError!) -> Void in
            if error == nil {
                for object in objects as [PFObject] {
                    companies.append(Company(object))
                }
                
                callback(companies: companies)
            } else if error != nil {
                println(error)
            }
        })
    }
}