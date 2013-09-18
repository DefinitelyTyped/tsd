# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  # Ubuntu 12.04 LTS 'Precise Pangolin'
  config.vm.box = "precise32"
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"

  config.vm.provision :chef_solo do |chef|
    # chef.log_level = :debug
    chef.cookbooks_path = "cookbooks"

    chef.add_recipe "main"

    chef.json = {
      "nodejs" => {
        "version" => "0.8",
        "install_method" => "package"
      }
    }
  end
end
