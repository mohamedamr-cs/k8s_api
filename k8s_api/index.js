const k8s = require('@kubernetes/client-node');

class K8sClient {
    constructor() {
        this.kc = new k8s.KubeConfig();

        // Auto-detect environment: in-cluster (EKS) or local
        if (process.env.KUBERNETES_SERVICE_HOST) {
            this.kc.loadFromCluster();
        } else {
            this.kc.loadFromDefault();
        }

        this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
        this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
    }

    async listNamespaces() {
        const res = await this.k8sApi.listNamespace();
        return res.body.items.map(ns => ns.metadata.name);
    }

    async listPods(namespace = 'default') {
        const res = await this.k8sApi.listNamespacedPod(namespace);
        return res.body.items.map(pod => ({
            name: pod.metadata.name,
            namespace: pod.metadata.namespace,
            status: pod.status.phase,
            node: pod.spec.nodeName
        }));
    }

    async listDeployments(namespace = 'default') {
        const res = await this.appsApi.listNamespacedDeployment(namespace);
        return res.body.items.map(dep => ({
            name: dep.metadata.name,
            replicas: dep.spec.replicas,
            ready: dep.status.readyReplicas
        }));
    }

    async listServices(namespace = 'default') {
        const res = await this.k8sApi.listNamespacedService(namespace);
        return res.body.items.map(svc => ({
            name: svc.metadata.name,
            type: svc.spec.type,
            clusterIP: svc.spec.clusterIP
        }));
    }

    async listNodes() {
        const res = await this.k8sApi.listNode();
        return res.body.items.map(node => ({
            name: node.metadata.name,
            role: node.metadata.labels?.role,
            status: node.status.conditions.find(c => c.type === 'Ready')?.status,
            capacity: node.status.capacity
        }));
    }

    async listNodesByLabel(labelSelector) {
        const res = await this.k8sApi.listNode(undefined, undefined, undefined, undefined, labelSelector);
        return res.body.items.map(node => ({
            name: node.metadata.name,
            role: node.metadata.labels?.role,
            status: node.status.conditions.find(c => c.type === 'Ready')?.status,
            capacity: node.status.capacity
        }));
    }

    async getPodLogs(name, namespace = 'default', tailLines = 100) {
        const res = await this.k8sApi.readNamespacedPodLog(name, namespace, undefined, false, undefined, undefined, undefined, undefined, undefined, tailLines);
        return res.body;
    }
}

module.exports = K8sClient;
