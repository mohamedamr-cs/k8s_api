const K8sClient = require('./index');

async function main() {
    const client = new K8sClient();

    try {
        console.log('=== Namespaces ===');
        const namespaces = await client.listNamespaces();
        console.log(namespaces);

        console.log('\n=== All Nodes ===');
        const nodes = await client.listNodes();
        console.log(nodes);

        console.log('\n=== CPU Nodes ===');
        const cpuNodes = await client.listNodesByLabel('role=cpu');
        console.log(cpuNodes);

        console.log('\n=== GPU Nodes ===');
        const gpuNodes = await client.listNodesByLabel('role=gpu');
        console.log(gpuNodes);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
