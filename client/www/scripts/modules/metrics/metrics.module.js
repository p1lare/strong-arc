var Metrics = angular.module('Metrics', []);
var METRICS_CONST = {
  CPU_TOTAL: 'cpu.total',
  CPU_SYSTEM: 'cpu.system',
  CPU_USER: 'cpu.user',
  HEAP_TOTAL:'heap.total',
  HEAP_USED:'heap.used',
  LOOP_AVG:'loop.average',
  LOOP_MAX:'loop.maximum',
  LOOP_MIN:'loop.minimum',
  LOOP_COUNT:'loop.count',
  HTTP_AVG:'http.average',
  HTTP_MAX:'http.maximum',
  HTTP_MIN:'http.minimum',
  HTTP_COUNT:'http.connection.count',
  MONGO_AVG:'tiers.mongodb.average',
  MONGO_MIN:'tiers.mongodb.minimum',
  MONGO_MAX: 'tiers.mongodb.maximum',
  MONGO_COUNT: 'mongodb.count',
  MYSQL_AVG: 'tiers.mysql.average',
  MYSQL_MIN: 'tiers.mysql.minimum',
  MYSQL_MAX: 'tiers.mysql.maximum',
  MYSQL_COUNT: 'mysql.count',
  REDIS_AVG: 'tiers.redis.average',
  REDIS_MIN: 'tiers.redis.minimum',
  REDIS_MAX: 'tiers.redis.maximum',
  REDIS_COUNT: 'redis.count',
  LEVELDOWN_AVG: 'tiers.leveldown.average',
  LEVELDOWN_MIN: 'tiers.leveldown.minimum',
  LEVELDOWN_MAX: 'tiers.leveldown.maximum',
  LEVELDOWN_COUNT: 'leveldown.count',
  DAO_AVG: 'tiers.dao.average',
  DAO_MIN: 'tiers.dao.minimum',
  DAO_MAX: 'tiers.dao.maximum',
  DAO_COUNT: 'dao.count',
  POSTGRES_AVG: 'tiers.postgres.average',
  POSTGRES_MIN: 'tiers.postgres.minimum',
  POSTGRES_MAX: 'tiers.postgres.maximum',
  POSTGRES_COUNT: 'postgres.count',
  RIAK_AVG: 'tiers.riak.average',
  RIAK_MIN: 'tiers.riak.minimum',
  RIAK_MAX: 'tiers.riak.maximum',
  RIAK_COUNT: 'riak.count',
  ORACLE_AVG: 'tiers.oracle.average',
  ORACLE_MIN: 'tiers.oracle.minimum',
  ORACLE_MAX: 'tiers.oracle.maximum',
  ORACLE_COUNT: 'oracle.count',
  MEMCACHED_AVG: 'tiers.memcached.average',
  MEMCACHED_MIN: 'tiers.memcached.minimum',
  MEMCACHED_MAX: 'tiers.memcached.maximum',
  MEMCACHED_COUNT: 'memcached.count'
};
Metrics.value('METRICS_CONST', METRICS_CONST);
