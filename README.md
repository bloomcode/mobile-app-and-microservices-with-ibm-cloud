# Develop Hybrid Mobile App with Microservices backend

In this sample, we will create a simple step tracker mobile app developed using Ionic. The application's backend is composed of microservices that are written in Node JS. The application's backend microservices will be deployed in Kubernetes, a container orchestration platform. The sample app is a simple step tracker that rewards users with "fitcoins". 

When you have completed this sample, you will understand how to:

* Build server-side application using microservices written in Node JS
* Use Node JS to connect to a Database
* Deploy the backend microservices in Kubernetes
* Integrate an Ionic app with the application backend
* Make Kubernetes available under a public domain with TLS.

## Flow

![Architecture diagram](assets/architecture.png)

1. The first time the app opens, it would try to register through the Users microservice.
2. The Users microservice communicates with an external service for its avatar assignment to the user.
3. The Users microservice then persists the user info in the database. The Users microservice would also update the steps of the users and award them "fitcoins".
4. The Leaderboard microservice provides a way to give the users standings with their steps count based on the stored data in the database.
5. The Shop microservice will get the products from the database where users can exchange them with their "fitcoins". This is also where the APIs for creating the transactions on updating the "fitcoins" of the users.

## Included Components

* [IBM Cloud Kubernetes Service](https://console.bluemix.net/docs/containers/container_index.html): IBM Bluemix Container Service manages highly available apps inside Docker containers and Kubernetes clusters on the IBM Cloud.
* [NodeJS](https://nodejs.org/): Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.
* [PostgreSQL](https://www.postgresql.org/): Sophisticated open-source Object-Relational DBMS supporting almost all SQL constructs.

## Few considerations

1. In a real time scenario, to compute the number of steps we would use a pedometer on the application. In the sample, to be able to use simulate / test on web, we are using a manual UI element (button) that when pressed adds the steps. 
2. As we use IBM Cloud Kubernetes Service, exposing apps via Ingress is not supported in Lite clusters. In such case, work around either creating a router application that frontends the backend microservices (or) expose apps using NodePort and configure the client app with the exposed NodePorts

## Featured Technologies

* [Container Orchestration](https://www.ibm.com/cloud/container-service): Automating the deployment, scaling and management of containerized applications.
* [Databases](https://en.wikipedia.org/wiki/IBM_Information_Management_System#.22Full_Function.22_databases): Repository for storing and managing collections of data.
* [Microservices](https://www.ibm.com/developerworks/community/blogs/5things/entry/5_things_to_know_about_microservices?lang=en): Collection of fine-grained, loosely coupled services using a lightweight protocol to provide building blocks in modern application composition in the cloud.
* [Ionic](https://ionicframework.com/): Ionic is the app development platform  to build cross platform mobile, web, and desktop apps all with one shared code base

# Prerequisites

* Create a _Standard_ Kubernetes cluster with [IBM Cloud Kubernetes Service](https://cloud.ibm.com/kubernetes/catalog/cluster) to deploy in cloud.
* Setup access to your cluster using the 'Access' instructions available in the Cluster details page from the IBM Cloud dashboad
* Install `Node.js` by downloading the setup from https://nodejs.org/en/ (Node.js 8.x or above)
```
$ node --version
v8.6.0
```
* Install Cordova
```
$ sudo npm install -g cordova@7.0.1
$ cordova --version
7.0.1
```
* Install Ionic
```
$ sudo npm install -g ionic@3.19.0
$ ionic --version
3.19.0
```
* [Optional] If you want to run the mobile app in a Android / iPhone device, install [Android Studio](https://developer.android.com/studio/install) / [Xcode](https://developer.apple.com/xcode/) for the respective paltforms.
* Install [Git] (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) CLI

# Steps

### 1. Clone the repo
```
$ git clone https://github.com/bloomcode/mobile-app-and-microservices-with-ibm-cloud.git
$ cd mobile-app-and-microservices-with-ibm-cloud
```
### 2. Create and Deploy Backend Microservices

* The backend microservices are already built. Their source code is in their respective folders in `containers` folder. You can open the repository folder in VS Code on IDE of your choice.


## b. Create IBM Cloud Kubernetes Service

Create an IBM Cloud Kubernetes Service if you don't already have one:

* [IBM Cloud Kubernetes Service](https://console.bluemix.net/containers-kubernetes/catalog/cluster)

* Simple tutorial to build an docker image and deploy it on kube - [click here](https://cloud.ibm.com/docs/containers?topic=containers-cs_apps_tutorial#cs_apps_tutorial_lesson1)

## c. Create and Deploy Nodejs Microservices

* The Nodejs applications are already built. Their source code is in their respective folders in `KubeNodeServer/dockerimages/` folder. 


```
$ ibmcloud cr build -t registry.<region>.bluemix.net/<namespace>/node-users:latest KubeNodeServer/dockerimages/user

$ ibmcloud cr build -t registry.<region>.bluemix.net/<namespace>/node-shop:latest KubeNodeServer/dockerimages/shop

$ ibmcloud cr build -t registry.<region>.bluemix.net/<namespace>/node-leaderboard:latest KubeNodeServer/dockerimages/leaderboard

```

> Note : 
Depending on the ibmcloud user plan ,your ability to push images onto ibmcloud container registry might be limited.

For namespace and registry details [click here](https://cloud.ibm.com/docs/services/Registry?topic=registry-index#registry_namespace_add)

* Edit these Kubernetes manifests files in `KubeNodeServer/manifests` folder to use your own images
  * leaderboard.yaml
  * shop.yaml
  * users.yaml

```
e.g. KubeNodeServer/manifests/leaderboard.yaml
...
    image: charankumar/node-leaderboard:1.0
    ## change the value to the images you just built in the previous step.
...
```

* You'll need to deploy a simple Postgres container in your cluster.
> This is only for testing (data will be deleted if container is destroyed/restarted). You'll need to setup your own persistency or you can use [Compose for PostgreSQL](https://www.ibm.com/cloud/compose/postgresql) for production.

```
## Create the credentials and deploy PostgreSQL
$ kubectl create cm postgres-cm --from-env-file=KubeNodeServer/postgres-config.env
$ kubectl apply -f KubeNodeServer/manifests/postgres.yaml

## Make sure the postgres container is running
$ kubectl get pods
```

* You can now deploy the Kitura microservices

```
$ kubectl apply -f KubeNodeServer/manifests/leaderboard.yaml
$ kubectl apply -f KubeNodeServer/manifests/shop.yaml
$ kubectl apply -f KubeNodeServer/manifests/users.yaml

## Make sure the 3 of them are running
$ kubectl get pods
```

<!-- ### 4. Expose with Kubernetes Ingress

* You would want to expose the backend you deployed so that the iOS app can communicate with it. With Kubernetes Ingress, this would allow you to expose these microservices. You can use the provided Ingress Subdomain that came with the IBM Cloud Kubernetes Service.

```
$ bx cs cluster-get <Your cluster name here>

## You should look for these values
## ..
## Ingress Subdomain: anthony-dev.us-south.containers.mybluemix.net
## Ingress Secret:    anthony-dev
## ..
```

* Modify `manifests/ingress.yaml` to use the provided subdomain you have

```
...
spec:
  tls:
  - hosts:
    - YOUR_INGRESS_SUBDOMAIN
    secretName: YOUR_INGRESS_SECRET
  backend:
    serviceName: users
    servicePort: 8080
  rules:
  - host: YOUR_INGRESS_SUBDOMAIN
...
```

> If you want to use your own domain, proceed to step #6

* Apply the Kubernetes Ingress resource

```
$ kubectl apply -f ingress-prod.yaml
```
 -->
 
 
 
## d. Test the Node servers to make sure they are running properly

```

## Create a user
$ curl -X POST -H 'Content-type: application/json' -d "$(curl http://<Kube-public-ip>:<nodeport>/users/generate)" http://<Kube-public-ip>:<nodeport>/users

{"userId":"3ed5e080-520c-11e9-8eeb-97cbc6e99afe","name":"Iasra Baxetra","image":"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","steps":0,"stepsConvertedToFitcoin":0,"fitcoin":0}

## Get the users
$ curl http://<Kube-public-ip>:<nodeport>/users

[ { "userId": "24f0c951-51f8-11e9-8154-0daaed3b2130", "name": "Ase Aiphiokroip", "steps": 0, "fitcoin": 0 }, { "userId": "41caff40-51f9-11e9-8dac-d50cf66b1929", "name": "Eor Graedretiu", "steps": 0, "fitcoin": 0 }, { "userId": "fec42040-51fe-11e9-aec4-ff78926d7850", "name": "Eor Graedretiu", "steps": 0, "fitcoin": 0 }, { "userId": "38c89d61-5200-11e9-9d53-316194177518", "name": "abcd", "steps": 0, "fitcoin": 0 }, { "userId": "42489a10-5201-11e9-bce3-a7cf2ce3f8c7", "name": "kiran", "steps": 0, "fitcoin": 0 }, { "userId": "4547f761-5201-11e9-bce3-a7cf2ce3f8c7", "name": "abcd", "steps": 0, "fitcoin": 0 }, { "userId": "3ed5e081-520c-11e9-8eeb-97cbc6e99afe", "name": "Iasra Baxetra", "steps": 0, "fitcoin": 0 } ]

## Create products
curl -X POST -H 'Content-type: application/json' -d "$(cat sampleProducts/smartwatch.json)" http://<Kube-public-ip>:<nodeport>/shop/products
curl -X POST -H 'Content-type: application/json' -d "$(cat sampleProducts/runningshoes.json)" http://<Kube-public-ip>:<nodeport>/shop/products
curl -X POST -H 'Content-type: application/json' -d "$(cat sampleProducts/smartbodyscale.json)" http://<Kube-public-ip>:<nodeport>/shop/products

## Get the products
$ curl http://<Kube-public-ip>:<nodeport>/shop/products

[{"productId":"smartwatch","price":20,"quantity":100,"name":"Smart Watch"},{"productId":"shoes","price":50,"quantity":25,"name":"Running Shoes"},{"productId":"bodyScale","price":5,"quantity":50,"name":"Body Scale"}]
```

<!-- ### 5. Configure the iOS app

Open the Xcode project `iOS/KituraStepTracker/KituraStepTracker.xcworkspace`

* Modify the lines in the files in `Controllers` folder and `AppDelegate.swift` that says

```
let KituraBackendUrl = "https://anthony-dev.us-south.containers.mybluemix.net"

## Change the variable to point to your own backend
## let KituraBackendUrl = "https://YOUR_INGRESS_SUBDOMAIN"
```

* You can now build and run it in a simulator. The app should now be connected to your Kitura microservices in Kubernetes.
> To test the step tracking part of the app, you would need a physical device with a pedometer (iPhone 5s+).

![screenshot](docs/sample.jpeg)

### 6. Use your own domain name and manage certificate with Let's Encrypt

To enable TLS in your own domain, you may want to automate issuance of the TLS certificates. You can do this with `cert-manager` to request certificates from Let's Encrypt.

* Go to your domain registrar and create an _**A record**_ for your domain to point to the IP address of your Kubernetes ingress. You can get the IP address of your ingress by doing:

![sample A record](docs/sample-a-record.png)

```
$ kubectl get ing

## NAME      HOSTS                  ADDRESS          PORTS     AGE
## ingress   www.ibm-fitchain.com   169.48.XYZ.XYZ   80, 443   2d
```

* You would need to first initialize `helm`. This will install `tiller` in your cluster.

```
$ helm init
```

* You can now install `cert-manager`

```
$ helm install \
    --name cert-manager \
    --namespace kube-system \
    stable/cert-manager
```

* Modify `cert-manager/issuer.yaml` to use your own valid email address.
  > More details [here](https://cert-manager.readthedocs.io/en/latest/tutorials/acme/http-validation.html)

```
...
email: EMAIL_ADDRESS
## change it to a valid one
...
```

* Deploy the issuer resource

```
$ kubectl apply -f cert-manager/issuer.yaml
```

* Modify `cert-manager/certificate.yaml`

```
...
spec:

  ## THIS WILL PRODUCE A CERTIFICATE NAMED ibm-fitchain-com-tls
  secretName: ibm-fitchain-com-tls
  issuerRef:
    name: letsencrypt-prod

  ## PROVIDE YOUR OWN DOMAIN NAME
  commonName: www.ibm-fitchain.com
  dnsNames:
  - www.ibm-fitchain.com
  acme:
    config:
    - http01:
        ingressClass: nginx
      domains:

      ## PROVIDE YOUR OWN DOMAIN NAME
      - www.ibm-fitchain.com
    - http01:
        ingress: my-ingress
      domains:

      ## PROVIDE YOUR OWN DOMAIN NAME
      - www.ibm-fitchain.com
```

* Deploy the certificate resource

```
$ kubectl apply -f cert-manager/certificate.yaml

## Wait for the certificate to get issued
$ kubectl describe certificate
```

* Once successful, you can check in your browser if your domain is working properly. If it has proper certificates, you should be able to see a Kitura starting page without security warning from your browser. _(You'll also see a lockpad icon beside your domain name)_ -->

<!-- # Links

* [Kitura](https://www.kitura.io/): A powerful server-side Swift web framework.
* [Swift-Kuery-ORM](https://github.com/IBM-Swift/Swift-Kuery-ORM): An ORM (Object Relational Mapping) library built for Swift. Using it allows you to simplify persistence of model objects with your server.
* [cert-manager](https://cert-manager.readthedocs.io/en/latest/index.html): A native Kubernetes certificate management controller. It can help with issuing certificates from a variety of sources, such as Let’s Encrypt, HashiCorp Vault or a simple signing keypair.
* [Deploy a Core ML model with Watson Visual Recognition](https://developer.ibm.com/code/patterns/deploy-a-core-ml-model-with-watson-visual-recognition): code pattern shows you how to create a Core ML model using Watson Visual Recognition, which is then deployed into an iOS application. -->

# Learn more

* **Kubernetes on IBM Cloud**: Deploy and manage your containers in [Kubernetes on IBM Cloud](https://www.ibm.com/cloud/container-service).
* **Microservices and Container Orchestration**:
Interested in microservices applications? Check out our other [Microservices Code Patterns](https://developer.ibm.com/code/technologies/microservices/) and [Container Orchestration Code Patterns](https://developer.ibm.com/code/technologies/container-orchestration/).


# License
This code pattern is licensed under the Apache Software License, Version 2.  Separate third party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](http://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](http://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
